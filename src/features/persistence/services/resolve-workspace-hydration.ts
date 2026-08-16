import type { PersistedWorkspace } from "../types/workspace";
import type { ClaimWorkspaceResponse } from "./workspace-client";
import {
  WorkspaceClaimRejectedError,
  WorkspaceNotFoundError,
} from "./workspace-client";

/**
 * Outcome of resolving the initial workspace hydration for an authenticated
 * user.
 *
 * - `hydrated`: a workspace was loaded (existing) or claimed (legacy anonymous)
 *   and its data should replace the local seed.
 * - `fresh`: the user has no recoverable remote data; a fresh new-user state is
 *   safe and autosave may be enabled.
 * - `error`: remote state is uncertain (network/5xx/unexpected). Autosave must
 *   remain disabled so default/local data never overwrites recoverable data.
 */
export type WorkspaceHydrationResult =
  | { kind: "hydrated"; workspace: PersistedWorkspace }
  | { kind: "fresh" }
  | { kind: "error"; message: string };

type ResolveWorkspaceHydrationDeps = {
  loadUserWorkspace: (
    signal?: AbortSignal,
  ) => Promise<PersistedWorkspace>;

  claimWorkspace: (
    anonymousWorkspaceId: string | null,
    signal?: AbortSignal,
  ) => Promise<ClaimWorkspaceResponse>;

  getStoredAnonymousWorkspaceId: () => string | null;

  signal?: AbortSignal;
};

function isAbort(
  error: unknown,
  signal?: AbortSignal,
): boolean {
  if (signal?.aborted) {
    return true;
  }

  return (
    error instanceof Error &&
    error.name === "AbortError"
  );
}

const LOAD_ERROR_MESSAGE =
  "Mova could not load your saved workspace.";

function toErrorResult(
  error: unknown,
): WorkspaceHydrationResult {
  return {
    kind: "error",
    message:
      error instanceof Error
        ? error.message
        : LOAD_ERROR_MESSAGE,
  };
}

/**
 * Pure, dependency-injected resolution of the initial hydration decision. All
 * I/O is passed in so this can be unit tested without React, fetch, or window.
 *
 * Aborts are rethrown so callers can ignore them rather than treating a
 * cancelled request as a genuine error.
 */
export async function resolveWorkspaceHydration({
  loadUserWorkspace,
  claimWorkspace,
  getStoredAnonymousWorkspaceId,
  signal,
}: ResolveWorkspaceHydrationDeps): Promise<WorkspaceHydrationResult> {
  try {
    const workspace = await loadUserWorkspace(signal);

    return { kind: "hydrated", workspace };
  } catch (error) {
    if (isAbort(error, signal)) {
      throw error;
    }

    if (!(error instanceof WorkspaceNotFoundError)) {
      // Network/server error on initial load: uncertain remote state.
      return toErrorResult(error);
    }
  }

  /*
   * No workspace yet for this user. Try to claim any pre-existing anonymous
   * browser workspace so legacy profile data is preserved. Skip the claim call
   * entirely when there is nothing to claim.
   */
  const anonymousWorkspaceId =
    getStoredAnonymousWorkspaceId();

  if (!anonymousWorkspaceId) {
    return { kind: "fresh" };
  }

  try {
    const claim = await claimWorkspace(
      anonymousWorkspaceId,
      signal,
    );

    if (claim.workspace) {
      return {
        kind: "hydrated",
        workspace: claim.workspace,
      };
    }

    return { kind: "fresh" };
  } catch (error) {
    if (isAbort(error, signal)) {
      throw error;
    }

    if (error instanceof WorkspaceClaimRejectedError) {
      // 409: the anonymous workspace belongs to someone else. Starting fresh
      // is safe because the server scopes writes to the verified user id.
      return { kind: "fresh" };
    }

    // Network/5xx/unexpected claim failure: uncertain remote state.
    return toErrorResult(error);
  }
}
