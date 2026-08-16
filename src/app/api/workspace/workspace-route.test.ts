import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { GET, PUT } from "./route";
import { POST as CLAIM } from "./claim/route";

import { getAuthenticatedUser } from
  "@/features/auth/services/session";
import {
  getWorkspaceByUserId,
  saveWorkspaceForUser,
} from "@/features/persistence/services/workspace-repository";
import {
  claimAnonymousWorkspace,
  WorkspaceClaimConflictError,
} from "@/features/persistence/services/claim-workspace";

vi.mock("@/features/auth/services/session", () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock(
  "@/features/persistence/services/workspace-repository",
  () => ({
    getWorkspaceByUserId: vi.fn(),
    saveWorkspaceForUser: vi.fn(),
  }),
);

vi.mock(
  "@/features/persistence/services/claim-workspace",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import(
          "@/features/persistence/services/claim-workspace"
        )
      >();

    return {
      ...actual,
      claimAnonymousWorkspace: vi.fn(),
    };
  },
);

const mockedGetUser = vi.mocked(getAuthenticatedUser);
const mockedGetByUser = vi.mocked(getWorkspaceByUserId);
const mockedSaveForUser = vi.mocked(saveWorkspaceForUser);
const mockedClaim = vi.mocked(claimAnonymousWorkspace);

function makeUser(id: string) {
  return { id, email: `${id}@example.com` } as Awaited<
    ReturnType<typeof getAuthenticatedUser>
  >;
}

const workspaceForUserA = {
  id: "ws-a",
  version: 2 as const,
  selectedRoleId: "product-engineer",
  profile: {
    id: "student-a",
    name: "A",
    courses: [],
    experiences: [],
    skills: [],
  },
  onboarding: { completed: true, step: "finish" as const },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const validSnapshot = {
  version: 2,
  selectedRoleId: "product-engineer",
  profile: {
    id: "student-a",
    name: "A",
    courses: [],
    experiences: [],
    skills: [],
  },
  onboarding: { completed: true, step: "finish" },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/workspace", () => {
  it("returns 401 when unauthenticated", async () => {
    mockedGetUser.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mockedGetByUser).not.toHaveBeenCalled();
  });

  it("reads only the authenticated user's workspace", async () => {
    mockedGetUser.mockResolvedValue(makeUser("user-a"));
    mockedGetByUser.mockResolvedValue(workspaceForUserA);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mockedGetByUser).toHaveBeenCalledWith("user-a");

    const body = await response.json();
    expect(body.id).toBe("ws-a");
  });

  it("returns 404 when the user has no workspace", async () => {
    mockedGetUser.mockResolvedValue(makeUser("user-a"));
    mockedGetByUser.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(404);
  });
});

describe("PUT /api/workspace", () => {
  it("returns 401 when unauthenticated", async () => {
    mockedGetUser.mockResolvedValue(null);

    const request = new Request(
      "http://localhost/api/workspace",
      {
        method: "PUT",
        body: JSON.stringify(validSnapshot),
      },
    );

    const response = await PUT(request);

    expect(response.status).toBe(401);
    expect(mockedSaveForUser).not.toHaveBeenCalled();
  });

  it("saves scoped to the authenticated user id", async () => {
    mockedGetUser.mockResolvedValue(makeUser("user-a"));
    mockedSaveForUser.mockResolvedValue(workspaceForUserA);

    const request = new Request(
      "http://localhost/api/workspace",
      {
        method: "PUT",
        body: JSON.stringify(validSnapshot),
      },
    );

    const response = await PUT(request);

    expect(response.status).toBe(200);
    expect(mockedSaveForUser).toHaveBeenCalledWith(
      "user-a",
      expect.objectContaining({ version: 2 }),
    );
  });
});

describe("POST /api/workspace/claim", () => {
  it("returns 401 when unauthenticated", async () => {
    mockedGetUser.mockResolvedValue(null);

    const request = new Request(
      "http://localhost/api/workspace/claim",
      {
        method: "POST",
        body: JSON.stringify({ anonymousWorkspaceId: null }),
      },
    );

    const response = await CLAIM(request);

    expect(response.status).toBe(401);
  });

  it("returns 409 when claiming another user's workspace", async () => {
    mockedGetUser.mockResolvedValue(makeUser("user-a"));
    mockedClaim.mockRejectedValue(
      new WorkspaceClaimConflictError(),
    );

    const request = new Request(
      "http://localhost/api/workspace/claim",
      {
        method: "POST",
        body: JSON.stringify({
          anonymousWorkspaceId:
            "a5f18354-3143-4a5e-a57c-b00e72fb7db6",
        }),
      },
    );

    const response = await CLAIM(request);

    expect(response.status).toBe(409);
  });

  it("returns the claimed workspace on success", async () => {
    mockedGetUser.mockResolvedValue(makeUser("user-a"));
    mockedClaim.mockResolvedValue({
      decision: "claim",
      workspace: workspaceForUserA,
    });

    const request = new Request(
      "http://localhost/api/workspace/claim",
      {
        method: "POST",
        body: JSON.stringify({
          anonymousWorkspaceId:
            "a5f18354-3143-4a5e-a57c-b00e72fb7db6",
        }),
      },
    );

    const response = await CLAIM(request);

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.decision).toBe("claim");
    expect(body.workspace.id).toBe("ws-a");
  });
});
