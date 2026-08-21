import { describe, expect, it, vi } from "vitest";

import {
  hydrateWorkspaceIfEnabled,
  isRemoteWorkspacePersistenceEnabled,
  persistWorkspaceIfEnabled,
} from "./workspace-persistence-gate";

describe("workspace persistence gate", () => {
  it("defaults to enabled remote persistence", () => {
    expect(isRemoteWorkspacePersistenceEnabled(undefined)).toBe(true);
    expect(isRemoteWorkspacePersistenceEnabled(true)).toBe(true);
    expect(isRemoteWorkspacePersistenceEnabled(false)).toBe(false);
  });

  it("does not call workspace clients when persistence is disabled", async () => {
    const loadUserWorkspace = vi.fn();
    const claimWorkspace = vi.fn();
    const getStoredAnonymousWorkspaceId = vi.fn();
    const persistUserWorkspace = vi.fn();

    const hydration = await hydrateWorkspaceIfEnabled(false, {
      loadUserWorkspace,
      claimWorkspace,
      getStoredAnonymousWorkspaceId,
    });

    const persisted = await persistWorkspaceIfEnabled(
      false,
      persistUserWorkspace,
      {
        version: 2,
        profile: {
          id: "demo-student",
          name: "Allyson Keightley",
          courses: [],
          experiences: [],
          skills: [],
        },
        selectedRoleId: "product-engineer",
        onboarding: { completed: true, step: "finish" },
      },
    );

    expect(hydration).toEqual({ kind: "disabled" });
    expect(persisted).toEqual({ kind: "disabled" });
    expect(loadUserWorkspace).not.toHaveBeenCalled();
    expect(claimWorkspace).not.toHaveBeenCalled();
    expect(getStoredAnonymousWorkspaceId).not.toHaveBeenCalled();
    expect(persistUserWorkspace).not.toHaveBeenCalled();
  });
});
