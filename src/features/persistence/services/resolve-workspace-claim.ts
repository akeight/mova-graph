export type WorkspaceClaimDecision =
  | "use-existing"
  | "already-owned"
  | "claim"
  | "reject"
  | "none";

export type OwnableWorkspace = {
  id: string;
  userId: string | null;
};

export type ResolveWorkspaceClaimInput = {
  userId: string;
  /** The workspace already owned by the authenticated user, if any. */
  existingUserWorkspace: OwnableWorkspace | null;
  /** The workspace referenced by the browser's anonymous id, if it exists. */
  anonymousWorkspace: OwnableWorkspace | null;
};

/**
 * Pure decision for how to reconcile a browser's anonymous workspace with the
 * authenticated user. Deliberately small and auditable, with no I/O so it can
 * be unit tested in isolation.
 *
 * - Never overwrites a workspace the user already owns.
 * - Never claims a workspace owned by a different user.
 */
export function resolveWorkspaceClaim({
  userId,
  existingUserWorkspace,
  anonymousWorkspace,
}: ResolveWorkspaceClaimInput): WorkspaceClaimDecision {
  if (!anonymousWorkspace) {
    return existingUserWorkspace ? "use-existing" : "none";
  }

  if (anonymousWorkspace.userId === userId) {
    return "already-owned";
  }

  if (anonymousWorkspace.userId !== null) {
    // Owned by someone else.
    return "reject";
  }

  // Anonymous workspace is unowned.
  if (existingUserWorkspace) {
    // Preserve the user's existing workspace; do not overwrite it.
    return "use-existing";
  }

  return "claim";
}
