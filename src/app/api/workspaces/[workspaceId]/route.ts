import { NextResponse } from
  "next/server";

import {
  workspaceIdSchema,
  workspaceSnapshotSchema,
} from "@/features/persistence/schemas/workspace";

import {
  getWorkspace,
  saveWorkspace,
} from "@/features/persistence/services/workspace-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    workspaceId: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  const { workspaceId } =
    await context.params;

  const parsedWorkspaceId =
    workspaceIdSchema.safeParse(
      workspaceId,
    );

  if (!parsedWorkspaceId.success) {
    return NextResponse.json(
      {
        error:
          "The workspace ID is invalid.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const workspace =
      await getWorkspace(
        parsedWorkspaceId.data,
      );

    if (!workspace) {
      return NextResponse.json(
        {
          error:
            "The workspace was not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      workspace,
    );
  } catch (error) {
    console.error(
      "Workspace loading failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Mova could not load this workspace.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext,
) {
  const { workspaceId } =
    await context.params;

  const parsedWorkspaceId =
    workspaceIdSchema.safeParse(
      workspaceId,
    );

  if (!parsedWorkspaceId.success) {
    return NextResponse.json(
      {
        error:
          "The workspace ID is invalid.",
      },
      {
        status: 400,
      },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "The request body must be valid JSON.",
      },
      {
        status: 400,
      },
    );
  }

  const parsedSnapshot =
    workspaceSnapshotSchema.safeParse(
      body,
    );

  if (!parsedSnapshot.success) {
    return NextResponse.json(
      {
        error:
          "The workspace data is invalid.",

        issues:
          parsedSnapshot.error
            .flatten()
            .fieldErrors,
      },
      {
        status: 400,
      },
    );
  }

  try {
    const workspace =
      await saveWorkspace(
        parsedWorkspaceId.data,
        parsedSnapshot.data,
      );

    return NextResponse.json(
      workspace,
    );
  } catch (error) {
    console.error(
      "Workspace saving failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Mova could not save this workspace.",
      },
      {
        status: 500,
      },
    );
  }
}