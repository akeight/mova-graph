import type { PersistedWorkspace } from "../types/workspace";

import {
  resolveWorkspaceClaim,
  type OwnableWorkspace,
  type WorkspaceClaimDecision,
} from "./resolve-workspace-claim";
import {
  assignWorkspaceOwner,
  getWorkspaceById,
  getWorkspaceByUserId,
  getWorkspaceOwnerId,
} from "./workspace-repository";

export {
  resolveWorkspaceClaim,
} from "./resolve-workspace-claim";
export type {
  WorkspaceClaimDecision,
} from "./resolve-workspace-claim";

export class WorkspaceClaimConflictError extends Error {
  constructor() {
    super("This workspace belongs to another account.");

    this.name = "WorkspaceClaimConflictError";
  }
}

export type ClaimWorkspaceResult = {
  decision: WorkspaceClaimDecision;
  workspace: PersistedWorkspace | null;
};

/**
 * Resolves and applies a claim for the authenticated user against a browser
 * anonymous workspace id. Returns the workspace the client should hydrate.
 */
export async function claimAnonymousWorkspace(
  userId: string,
  anonymousWorkspaceId: string | null,
): Promise<ClaimWorkspaceResult> {
  const existingUserWorkspace =
    await getWorkspaceByUserId(userId);

  const existingOwnable: OwnableWorkspace | null =
    existingUserWorkspace
      ? { id: existingUserWorkspace.id, userId }
      : null;

  let anonymousOwnable: OwnableWorkspace | null = null;

  if (anonymousWorkspaceId) {
    const { found, ownerId } =
      await getWorkspaceOwnerId(anonymousWorkspaceId);

    if (found) {
      anonymousOwnable = {
        id: anonymousWorkspaceId,
        userId: ownerId,
      };
    }
  }

  const decision = resolveWorkspaceClaim({
    userId,
    existingUserWorkspace: existingOwnable,
    anonymousWorkspace: anonymousOwnable,
  });

  switch (decision) {
    case "use-existing":
      return { decision, workspace: existingUserWorkspace };

    case "already-owned":
      return {
        decision,
        workspace: await getWorkspaceById(
          anonymousWorkspaceId!,
        ),
      };

    case "reject":
      throw new WorkspaceClaimConflictError();

    case "claim": {
      const claimed = await assignWorkspaceOwner(
        anonymousWorkspaceId!,
        userId,
      );

      if (!claimed) {
        // Lost a race: the row was owned between read and write.
        throw new WorkspaceClaimConflictError();
      }

      return { decision, workspace: claimed };
    }

    case "none":
    default:
      return { decision: "none", workspace: null };
  }
}
