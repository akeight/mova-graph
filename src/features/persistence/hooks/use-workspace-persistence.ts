"use client";

import {
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

  const [hasHydrated, setHasHydrated] =
    useState(false);

  const [status, setStatus] =
    useState<WorkspaceSaveStatus>(
      "loading",
    );

  const [lastSavedAt, setLastSavedAt] =
    useState<Date | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const controller =
      new AbortController();

    const hydrateWorkspace =
      async () => {
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
            setStatus("saved");
          } else {
            setStatus("error");

            setError(
              caughtError instanceof Error
                ? caughtError.message
                : "Mova could not load your saved workspace.",
            );
          }
        } finally {
          if (
            !controller.signal.aborted
          ) {
            setHasHydrated(true);
          }
        }
      };

    void hydrateWorkspace();

    return () => {
      controller.abort();
    };
  }, [onHydrate]);

  useEffect(() => {
    if (
      !workspaceId ||
      !hasHydrated
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
    hasHydrated,
    profile,
    selectedRoleId,
    workspaceId,
  ]);

  return {
    status,
    lastSavedAt,
    error,
  };
}