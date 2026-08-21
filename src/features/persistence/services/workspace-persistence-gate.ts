import type { PersistedWorkspace, WorkspaceSnapshot } from "../types/workspace";
import type { ResolveWorkspaceHydrationDeps } from "./resolve-workspace-hydration";
import { resolveWorkspaceHydration } from "./resolve-workspace-hydration";

export type WorkspacePersistenceClients = Pick<
  ResolveWorkspaceHydrationDeps,
  "loadUserWorkspace" | "claimWorkspace" | "getStoredAnonymousWorkspaceId"
> & {
  persistUserWorkspace: (
    snapshot: WorkspaceSnapshot,
    signal?: AbortSignal,
  ) => Promise<PersistedWorkspace>;
};

/**
 * When persistence is disabled, skip every workspace client call and treat the
 * session as local-only. Callers must still run React hooks unconditionally and
 * return early from effects.
 */
export function isRemoteWorkspacePersistenceEnabled(
  enabled: boolean | undefined,
): boolean {
  return enabled !== false;
}

export async function hydrateWorkspaceIfEnabled(
  enabled: boolean | undefined,
  deps: ResolveWorkspaceHydrationDeps,
) {
  if (!isRemoteWorkspacePersistenceEnabled(enabled)) {
    return { kind: "disabled" as const };
  }

  return resolveWorkspaceHydration(deps);
}

export async function persistWorkspaceIfEnabled(
  enabled: boolean | undefined,
  persistUserWorkspace: WorkspacePersistenceClients["persistUserWorkspace"],
  snapshot: WorkspaceSnapshot,
  signal?: AbortSignal,
) {
  if (!isRemoteWorkspacePersistenceEnabled(enabled)) {
    return { kind: "disabled" as const };
  }

  return {
    kind: "saved" as const,
    workspace: await persistUserWorkspace(snapshot, signal),
  };
}
