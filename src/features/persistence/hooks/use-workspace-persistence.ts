"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type { OnboardingState } from
  "@/features/onboarding/types/onboarding";
import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";

import {
  claimWorkspace,
  getStoredAnonymousWorkspaceId,
  loadUserWorkspace,
  persistUserWorkspace,
} from "../services/workspace-client";

import {
  hydrateWorkspaceIfEnabled,
  persistWorkspaceIfEnabled,
} from "../services/workspace-persistence-gate";

import type {
  PersistedWorkspace,
  WorkspaceHydrationStatus,
  WorkspaceSaveStatus,
} from "../types/workspace";

const SAVE_DELAY_MS = 750;

type UseWorkspacePersistenceOptions = {
  profile: StudentProfile;
  selectedRoleId: string;
  onboarding: OnboardingState;
  enabled?: boolean;

  onHydrate: (workspace: PersistedWorkspace) => void;
};

export function useWorkspacePersistence({
  profile,
  selectedRoleId,
  onboarding,
  enabled = true,
  onHydrate,
}: UseWorkspacePersistenceOptions) {
  const [hydrationStatus, setHydrationStatus] =
    useState<WorkspaceHydrationStatus>(
      () => (enabled ? "loading" : "local-only"),
    );

  const [hydrationAttempt, setHydrationAttempt] =
    useState(0);

  const [status, setStatus] =
    useState<WorkspaceSaveStatus>(
      () => (enabled ? "loading" : "local-only"),
    );

  const [lastSavedAt, setLastSavedAt] =
    useState<Date | null>(null);

  const [error, setError] = useState<string | null>(null);

  const retryHydration = useCallback(() => {
    setHydrationStatus("loading");
    setStatus("loading");
    setError(null);

    setHydrationAttempt(
      (currentAttempt) => currentAttempt + 1,
    );
  }, []);

  const continueWithoutPersistence = useCallback(() => {
    setHydrationStatus("local-only");

    setStatus("local-only");
    setLastSavedAt(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();

    const hydrateWorkspace = async () => {
      setHydrationStatus("loading");
      setStatus("loading");
      setError(null);

      let result;

      try {
        result = await hydrateWorkspaceIfEnabled(enabled, {
          loadUserWorkspace,
          claimWorkspace,
          getStoredAnonymousWorkspaceId,
          signal: controller.signal,
        });
      } catch {
        // Only aborts are rethrown; a cancelled hydration is ignored.
        return;
      }

      if (controller.signal.aborted) {
        return;
      }

      if (result.kind === "disabled") {
        setHydrationStatus("local-only");
        setStatus("local-only");
        setLastSavedAt(null);
        return;
      }

      if (result.kind === "hydrated") {
        onHydrate(result.workspace);

        setLastSavedAt(
          new Date(result.workspace.updatedAt),
        );
        setHydrationStatus("ready");
        setStatus("saved");

        return;
      }

      if (result.kind === "fresh") {
        setLastSavedAt(null);
        setHydrationStatus("ready");
        setStatus("saved");

        return;
      }

      /*
       * Uncertain remote state (network/5xx/unexpected). Keep autosave disabled
       * so default/local data never overwrites recoverable persisted data.
       */
      setHydrationStatus("error");
      setStatus("error");
      setError(result.message);
    };

    void hydrateWorkspace();

    return () => {
      controller.abort();
    };
  }, [enabled, hydrationAttempt, onHydrate]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (hydrationStatus !== "ready") {
      return;
    }

    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      setStatus("saving");
      setError(null);

      try {
        const persisted = await persistWorkspaceIfEnabled(
          enabled,
          persistUserWorkspace,
          {
            version: 2,
            profile,
            selectedRoleId,
            onboarding,
          },
          controller.signal,
        );

        if (persisted.kind === "disabled") {
          setHydrationStatus("local-only");
          setStatus("local-only");
          setLastSavedAt(null);
          return;
        }

        setLastSavedAt(new Date(persisted.workspace.updatedAt));
        setStatus("saved");
      } catch (caughtError) {
        if (controller.signal.aborted) {
          return;
        }

        setStatus("error");

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Mova could not save your workspace.",
        );
      }
    }, SAVE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    enabled,
    hydrationStatus,
    profile,
    selectedRoleId,
    onboarding,
  ]);

  return {
    hydrationStatus,
    status,
    lastSavedAt,
    error,
    retryHydration,
    continueWithoutPersistence,
  };
}
