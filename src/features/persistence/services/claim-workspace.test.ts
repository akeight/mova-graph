import { describe, expect, it } from "vitest";

import { resolveWorkspaceClaim } from "./resolve-workspace-claim";

const USER = "user-a";
const OTHER_USER = "user-b";

describe("resolveWorkspaceClaim", () => {
  it("claims an unowned anonymous workspace when the user has none", () => {
    const decision = resolveWorkspaceClaim({
      userId: USER,
      existingUserWorkspace: null,
      anonymousWorkspace: { id: "ws-1", userId: null },
    });

    expect(decision).toBe("claim");
  });

  it("rejects claiming a workspace owned by another user", () => {
    const decision = resolveWorkspaceClaim({
      userId: USER,
      existingUserWorkspace: null,
      anonymousWorkspace: {
        id: "ws-1",
        userId: OTHER_USER,
      },
    });

    expect(decision).toBe("reject");
  });

  it("treats a workspace already owned by the user as already-owned", () => {
    const decision = resolveWorkspaceClaim({
      userId: USER,
      existingUserWorkspace: null,
      anonymousWorkspace: { id: "ws-1", userId: USER },
    });

    expect(decision).toBe("already-owned");
  });

  it("never overwrites an existing user workspace with an unowned anonymous one", () => {
    const decision = resolveWorkspaceClaim({
      userId: USER,
      existingUserWorkspace: { id: "ws-own", userId: USER },
      anonymousWorkspace: { id: "ws-anon", userId: null },
    });

    expect(decision).toBe("use-existing");
  });

  it("uses the existing workspace when there is no anonymous workspace", () => {
    const decision = resolveWorkspaceClaim({
      userId: USER,
      existingUserWorkspace: { id: "ws-own", userId: USER },
      anonymousWorkspace: null,
    });

    expect(decision).toBe("use-existing");
  });

  it("returns none when there is nothing to claim and no existing workspace", () => {
    const decision = resolveWorkspaceClaim({
      userId: USER,
      existingUserWorkspace: null,
      anonymousWorkspace: null,
    });

    expect(decision).toBe("none");
  });
});
