import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedUser } from
  "@/features/auth/services/session";
import {
  claimAnonymousWorkspace,
  WorkspaceClaimConflictError,
} from "@/features/persistence/services/claim-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const claimRequestSchema = z.object({
  anonymousWorkspaceId: z
    .string()
    .uuid()
    .nullable()
    .optional(),
});

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = claimRequestSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return NextResponse.json(
      { error: "The claim request is invalid." },
      { status: 400 },
    );
  }

  try {
    const result = await claimAnonymousWorkspace(
      user.id,
      parsed.data.anonymousWorkspaceId ?? null,
    );

    return NextResponse.json({
      decision: result.decision,
      workspace: result.workspace,
    });
  } catch (error) {
    if (error instanceof WorkspaceClaimConflictError) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 },
      );
    }

    console.error("Workspace claim failed:", error);

    return NextResponse.json(
      { error: "Mova could not claim this workspace." },
      { status: 500 },
    );
  }
}
