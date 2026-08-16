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
  WorkspaceNotFoundError,
} from "../services/workspace-client";

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

  onHydrate: (workspace: PersistedWorkspace) => void;
};

export function useWorkspacePersistence({
  profile,
  selectedRoleId,
  onboarding,
  onHydrate,
}: UseWorkspacePersistenceOptions) {
  const [hydrationStatus, setHydrationStatus] =
    useState<WorkspaceHydrationStatus>("loading");

  const [hydrationAttempt, setHydrationAttempt] =
    useState(0);

  const [status, setStatus] =
    useState<WorkspaceSaveStatus>("loading");

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
    const controller = new AbortController();

    const hydrateWorkspace = async () => {
      setHydrationStatus("loading");
      setStatus("loading");
      setError(null);

      try {
        const workspace = await loadUserWorkspace(
          controller.signal,
        );

        onHydrate(workspace);

        setLastSavedAt(new Date(workspace.updatedAt));
        setHydrationStatus("ready");
        setStatus("saved");

        return;
      } catch (caughtError) {
        if (controller.signal.aborted) {
          return;
        }

        if (!(caughtError instanceof WorkspaceNotFoundError)) {
          /*
           * Do not mark hydration ready after a network/server error.
           * Autosave stays disabled until the user retries successfully or
           * enters local demo mode, so we never overwrite remote data.
           */
          setHydrationStatus("error");
          setStatus("error");

          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Mova could not load your saved workspace.",
          );

          return;
        }
      }

      /*
       * No workspace yet for this user. Before enabling autosave, attempt to
       * claim any pre-existing anonymous browser workspace so existing profile
       * data is preserved and never overwritten by the default demo profile.
       */
      try {
        const anonymousWorkspaceId =
          getStoredAnonymousWorkspaceId();

        const claim = await claimWorkspace(
          anonymousWorkspaceId,
          controller.signal,
        );

        if (claim.workspace) {
          onHydrate(claim.workspace);

          setLastSavedAt(new Date(claim.workspace.updatedAt));
        } else {
          setLastSavedAt(null);
        }

        setHydrationStatus("ready");
        setStatus("saved");
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        /*
         * A rejected or failed claim must not brick the app. Fall back to a
         * fresh workspace for this user; autosave is safe because the server
         * scopes writes to the verified user id.
         */
        setLastSavedAt(null);
        setHydrationStatus("ready");
        setStatus("saved");
      }
    };

    void hydrateWorkspace();

    return () => {
      controller.abort();
    };
  }, [hydrationAttempt, onHydrate]);

  useEffect(() => {
    if (hydrationStatus !== "ready") {
      return;
    }

    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      setStatus("saving");
      setError(null);

      try {
        const workspace = await persistUserWorkspace(
          {
            version: 2,
            profile,
            selectedRoleId,
            onboarding,
          },
          controller.signal,
        );

        setLastSavedAt(new Date(workspace.updatedAt));
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
