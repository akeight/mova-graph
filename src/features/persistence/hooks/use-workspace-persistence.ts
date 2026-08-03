"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";

import {
  getOrCreateWorkspaceId,
  loadWorkspace,
  persistWorkspace,
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

  onHydrate: (
    workspace: PersistedWorkspace,
  ) => void;
};

export function useWorkspacePersistence({
  profile,
  selectedRoleId,
  onHydrate,
}: UseWorkspacePersistenceOptions) {
  const [workspaceId, setWorkspaceId] =
    useState<string | null>(null);

  const [
    hydrationStatus,
    setHydrationStatus,
  ] =
    useState<WorkspaceHydrationStatus>(
      "loading",
    );

  const [
    hydrationAttempt,
    setHydrationAttempt,
  ] = useState(0);

  const [status, setStatus] =
    useState<WorkspaceSaveStatus>(
      "loading",
    );

  const [lastSavedAt, setLastSavedAt] =
    useState<Date | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const retryHydration =
    useCallback(() => {
      setHydrationStatus("loading");
      setStatus("loading");
      setError(null);

      setHydrationAttempt(
        (currentAttempt) =>
          currentAttempt + 1,
      );
    }, []);

  const continueWithoutPersistence =
    useCallback(() => {
      setHydrationStatus(
        "local-only",
      );

      setStatus("local-only");
      setLastSavedAt(null);
      setError(null);
    }, []);

  useEffect(() => {
    const controller =
      new AbortController();

    const hydrateWorkspace =
      async () => {
        setHydrationStatus(
          "loading",
        );

        setStatus("loading");
        setError(null);

        const nextWorkspaceId =
          getOrCreateWorkspaceId();

        setWorkspaceId(
          nextWorkspaceId,
        );

        try {
          const workspace =
            await loadWorkspace(
              nextWorkspaceId,
              controller.signal,
            );

          onHydrate(workspace);

          setLastSavedAt(
            new Date(
              workspace.updatedAt,
            ),
          );

          setHydrationStatus(
            "ready",
          );

          setStatus("saved");
        } catch (caughtError) {
          if (
            controller.signal.aborted
          ) {
            return;
          }

          if (
            caughtError instanceof
            WorkspaceNotFoundError
          ) {
            /*
             * A 404 is expected for a brand-new
             * anonymous workspace.
             *
             * The initial profile may now be saved
             * safely because we know there is no
             * existing remote workspace to overwrite.
             */
            setLastSavedAt(null);

            setHydrationStatus(
              "ready",
            );

            setStatus("saved");

            return;
          }

          /*
           * Do not mark hydration as ready after a
           * network, server, or database error.
           *
           * Autosave remains disabled until the user
           * retries successfully or explicitly enters
           * local demo mode.
           */
          setHydrationStatus(
            "error",
          );

          setStatus("error");

          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Mova could not load your saved workspace.",
          );
        }
      };

    void hydrateWorkspace();

    return () => {
      controller.abort();
    };
  }, [
    hydrationAttempt,
    onHydrate,
  ]);

  useEffect(() => {
    if (
      !workspaceId ||
      hydrationStatus !== "ready"
    ) {
      return;
    }

    const controller =
      new AbortController();

    const timeoutId =
      window.setTimeout(
        async () => {
          setStatus("saving");
          setError(null);

          try {
            const workspace =
              await persistWorkspace(
                workspaceId,
                {
                  version: 1,
                  profile,
                  selectedRoleId,
                },
                controller.signal,
              );

            setLastSavedAt(
              new Date(
                workspace.updatedAt,
              ),
            );

            setStatus("saved");
          } catch (caughtError) {
            if (
              controller.signal.aborted
            ) {
              return;
            }

            setStatus("error");

            setError(
              caughtError instanceof Error
                ? caughtError.message
                : "Mova could not save your workspace.",
            );
          }
        },
        SAVE_DELAY_MS,
      );

    return () => {
      window.clearTimeout(
        timeoutId,
      );

      controller.abort();
    };
  }, [
    hydrationStatus,
    profile,
    selectedRoleId,
    workspaceId,
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