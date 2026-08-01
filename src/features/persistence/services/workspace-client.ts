import type {
    PersistedWorkspace,
    WorkspaceSnapshot,
  } from "../types/workspace";
  
  const WORKSPACE_STORAGE_KEY =
    "mova-workspace-id";
  
  type ErrorResponse = {
    error?: string;
  };
  
  export class WorkspaceNotFoundError
    extends Error {
    constructor() {
      super(
        "No saved workspace exists yet.",
      );
  
      this.name =
        "WorkspaceNotFoundError";
    }
  }
  
  export function getOrCreateWorkspaceId():
    string {
    const existingWorkspaceId =
      window.localStorage.getItem(
        WORKSPACE_STORAGE_KEY,
      );
  
    if (existingWorkspaceId) {
      return existingWorkspaceId;
    }
  
    const workspaceId =
      crypto.randomUUID();
  
    window.localStorage.setItem(
      WORKSPACE_STORAGE_KEY,
      workspaceId,
    );
  
    return workspaceId;
  }
  
  async function readErrorMessage(
    response: Response,
  ): Promise<string> {
    try {
      const payload =
        await response.json() as
          ErrorResponse;
  
      return (
        payload.error ??
        "The workspace request failed."
      );
    } catch {
      return (
        "The workspace request failed."
      );
    }
  }
  
  export async function loadWorkspace(
    workspaceId: string,
    signal?: AbortSignal,
  ): Promise<PersistedWorkspace> {
    const response = await fetch(
      `/api/workspaces/${workspaceId}`,
      {
        method: "GET",
        cache: "no-store",
        signal,
      },
    );
  
    if (response.status === 404) {
      throw new WorkspaceNotFoundError();
    }
  
    if (!response.ok) {
      throw new Error(
        await readErrorMessage(response),
      );
    }
  
    return response.json();
  }
  
  export async function persistWorkspace(
    workspaceId: string,
    snapshot: WorkspaceSnapshot,
    signal?: AbortSignal,
  ): Promise<PersistedWorkspace> {
    const response = await fetch(
      `/api/workspaces/${workspaceId}`,
      {
        method: "PUT",
  
        headers: {
          "Content-Type":
            "application/json",
        },
  
        body: JSON.stringify(snapshot),
        signal,
      },
    );
  
    if (!response.ok) {
      throw new Error(
        await readErrorMessage(response),
      );
    }
  
    return response.json();
  }