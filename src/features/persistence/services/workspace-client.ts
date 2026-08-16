import type {
  PersistedWorkspace,
  WorkspaceSnapshot,
} from "../types/workspace";
import type { WorkspaceClaimDecision } from "./claim-workspace";

const WORKSPACE_STORAGE_KEY = "mova-workspace-id";

type ErrorResponse = {
  error?: string;
};

export class WorkspaceNotFoundError extends Error {
  constructor() {
    super("No saved workspace exists yet.");

    this.name = "WorkspaceNotFoundError";
  }
}

export class WorkspaceClaimRejectedError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "WorkspaceClaimRejectedError";
  }
}

/**
 * Reads the legacy anonymous workspace id from localStorage, if present.
 *
 * We no longer create anonymous ids: authenticated workspaces are keyed by the
 * verified user id server-side. This getter only supports claiming a
 * pre-existing anonymous workspace.
 */
export function getStoredAnonymousWorkspaceId(): string | null {
  return window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
}

export function clearStoredAnonymousWorkspaceId(): void {
  window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
}

async function readErrorMessage(
  response: Response,
): Promise<string> {
  try {
    const payload = (await response.json()) as ErrorResponse;

    return payload.error ?? "The workspace request failed.";
  } catch {
    return "The workspace request failed.";
  }
}

export async function loadUserWorkspace(
  signal?: AbortSignal,
): Promise<PersistedWorkspace> {
  const response = await fetch("/api/workspace", {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (response.status === 404) {
    throw new WorkspaceNotFoundError();
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}

export type ClaimWorkspaceResponse = {
  decision: WorkspaceClaimDecision;
  workspace: PersistedWorkspace | null;
};

export async function claimWorkspace(
  anonymousWorkspaceId: string | null,
  signal?: AbortSignal,
): Promise<ClaimWorkspaceResponse> {
  const response = await fetch("/api/workspace/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ anonymousWorkspaceId }),
    signal,
  });

  if (response.status === 409) {
    throw new WorkspaceClaimRejectedError(
      await readErrorMessage(response),
    );
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}

export async function persistUserWorkspace(
  snapshot: WorkspaceSnapshot,
  signal?: AbortSignal,
): Promise<PersistedWorkspace> {
  const response = await fetch("/api/workspace", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snapshot),
    signal,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}
