import { NextResponse } from "next/server";

import { getAuthenticatedUser } from
  "@/features/auth/services/session";
import { workspaceSnapshotSchema } from
  "@/features/persistence/schemas/workspace";
import {
  getWorkspaceByUserId,
  saveWorkspaceForUser,
} from "@/features/persistence/services/workspace-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 },
    );
  }

  try {
    const workspace = await getWorkspaceByUserId(user.id);

    if (!workspace) {
      return NextResponse.json(
        { error: "The workspace was not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Workspace loading failed:", error);

    return NextResponse.json(
      { error: "Mova could not load this workspace." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
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
    return NextResponse.json(
      { error: "The request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsedSnapshot =
    workspaceSnapshotSchema.safeParse(body);

  if (!parsedSnapshot.success) {
    return NextResponse.json(
      {
        error: "The workspace data is invalid.",
        issues: parsedSnapshot.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const workspace = await saveWorkspaceForUser(
      user.id,
      parsedSnapshot.data,
    );

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Workspace saving failed:", error);

    return NextResponse.json(
      { error: "Mova could not save this workspace." },
      { status: 500 },
    );
  }
}
