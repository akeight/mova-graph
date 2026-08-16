import { describe, expect, it, vi } from "vitest";

import type {
  PersistedWorkspace,
  WorkspaceSnapshot,
} from "../types/workspace";
import type { ClaimWorkspaceResponse } from "./workspace-client";
import {
  WorkspaceClaimRejectedError,
  WorkspaceNotFoundError,
} from "./workspace-client";
import { resolveWorkspaceHydration } from
  "./resolve-workspace-hydration";

function buildWorkspace(
  overrides: Partial<PersistedWorkspace> = {},
): PersistedWorkspace {
  const snapshot: WorkspaceSnapshot = {
    version: 2,
    selectedRoleId: "product-engineer",
    profile: {
      id: "legacy-user",
      name: "Legacy User",
      courses: [],
      experiences: [],
      skills: [],
    },
    onboarding: { completed: true, step: "finish" },
  };

  return {
    id: "workspace-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    ...snapshot,
    ...overrides,
  };
}

function buildDeps(overrides: {
  loadUserWorkspace?: () => Promise<PersistedWorkspace>;
  claimWorkspace?: () => Promise<ClaimWorkspaceResponse>;
  getStoredAnonymousWorkspaceId?: () => string | null;
}) {
  return {
    loadUserWorkspace:
      overrides.loadUserWorkspace ??
      (() => Promise.reject(new WorkspaceNotFoundError())),
    claimWorkspace:
      overrides.claimWorkspace ??
      (() =>
        Promise.resolve({
          decision: "none",
          workspace: null,
        } satisfies ClaimWorkspaceResponse)),
    getStoredAnonymousWorkspaceId:
      overrides.getStoredAnonymousWorkspaceId ??
      (() => null),
  };
}

describe("resolveWorkspaceHydration", () => {
  it("hydrates an existing authenticated workspace", async () => {
    const workspace = buildWorkspace();

    const deps = buildDeps({
      loadUserWorkspace: () => Promise.resolve(workspace),
    });

    const result = await resolveWorkspaceHydration(deps);

    expect(result).toEqual({
      kind: "hydrated",
      workspace,
    });
  });

  it("returns fresh for a new user with no anonymous workspace", async () => {
    const claimWorkspace = vi.fn();

    const deps = buildDeps({
      loadUserWorkspace: () =>
        Promise.reject(new WorkspaceNotFoundError()),
      getStoredAnonymousWorkspaceId: () => null,
      claimWorkspace,
    });

    const result = await resolveWorkspaceHydration(deps);

    expect(result).toEqual({ kind: "fresh" });
    expect(claimWorkspace).not.toHaveBeenCalled();
  });

  it("hydrates legacy data from a successful anonymous claim", async () => {
    const workspace = buildWorkspace({ id: "claimed-1" });

    const deps = buildDeps({
      loadUserWorkspace: () =>
        Promise.reject(new WorkspaceNotFoundError()),
      getStoredAnonymousWorkspaceId: () => "anon-123",
      claimWorkspace: () =>
        Promise.resolve({
          decision: "claim",
          workspace,
        }),
    });

    const result = await resolveWorkspaceHydration(deps);

    expect(result).toEqual({
      kind: "hydrated",
      workspace,
    });
  });

  it("allows a fresh workspace when a claim is rejected (409)", async () => {
    const deps = buildDeps({
      loadUserWorkspace: () =>
        Promise.reject(new WorkspaceNotFoundError()),
      getStoredAnonymousWorkspaceId: () => "anon-123",
      claimWorkspace: () =>
        Promise.reject(
          new WorkspaceClaimRejectedError(
            "This workspace belongs to another account.",
          ),
        ),
    });

    const result = await resolveWorkspaceHydration(deps);

    expect(result).toEqual({ kind: "fresh" });
  });

  it("returns error when the claim fails with a network/500 error", async () => {
    const deps = buildDeps({
      loadUserWorkspace: () =>
        Promise.reject(new WorkspaceNotFoundError()),
      getStoredAnonymousWorkspaceId: () => "anon-123",
      claimWorkspace: () =>
        Promise.reject(new Error("Internal Server Error")),
    });

    const result = await resolveWorkspaceHydration(deps);

    expect(result).toEqual({
      kind: "error",
      message: "Internal Server Error",
    });
  });

  it("returns error when the initial load fails with a network/500 error", async () => {
    const deps = buildDeps({
      loadUserWorkspace: () =>
        Promise.reject(new Error("Service Unavailable")),
    });

    const result = await resolveWorkspaceHydration(deps);

    expect(result).toEqual({
      kind: "error",
      message: "Service Unavailable",
    });
  });

  it("rethrows abort errors so callers can ignore them", async () => {
    const controller = new AbortController();
    controller.abort();

    const abortError = new Error("Aborted");
    abortError.name = "AbortError";

    const deps = buildDeps({
      loadUserWorkspace: () => Promise.reject(abortError),
    });

    await expect(
      resolveWorkspaceHydration({
        ...deps,
        signal: controller.signal,
      }),
    ).rejects.toBe(abortError);
  });
});
