import { eq } from "drizzle-orm";

import { db } from "@/lib/db/index";
import { studentWorkspaces } from "@/lib/db/schema/student-workspaces";

import { workspaceSnapshotSchema } from
  "../schemas/workspace";

import type {
  PersistedWorkspace,
  WorkspaceSnapshot,
} from "../types/workspace";

function mapWorkspaceRow(
  row: typeof studentWorkspaces.$inferSelect,
): PersistedWorkspace {
  const snapshot =
    workspaceSnapshotSchema.parse({
      version: row.version,
      profile: row.profile,
      selectedRoleId: row.selectedRoleId,
    });

  return {
    id: row.id,
    ...snapshot,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getWorkspace(
  workspaceId: string,
): Promise<PersistedWorkspace | null> {
  const [row] = await db
    .select()
    .from(studentWorkspaces)
    .where(
      eq(
        studentWorkspaces.id,
        workspaceId,
      ),
    )
    .limit(1);

  return row
    ? mapWorkspaceRow(row)
    : null;
}

export async function saveWorkspace(
  workspaceId: string,
  snapshot: WorkspaceSnapshot,
): Promise<PersistedWorkspace> {
  const validatedSnapshot =
    workspaceSnapshotSchema.parse(
      snapshot,
    );

  const now = new Date();

  const [row] = await db
    .insert(studentWorkspaces)
    .values({
      id: workspaceId,
      version: validatedSnapshot.version,
      selectedRoleId:
        validatedSnapshot.selectedRoleId,
      profile:
        validatedSnapshot.profile,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: studentWorkspaces.id,

      set: {
        version:
          validatedSnapshot.version,
        selectedRoleId:
          validatedSnapshot.selectedRoleId,
        profile:
          validatedSnapshot.profile,
        updatedAt: now,
      },
    })
    .returning();

  if (!row) {
    throw new Error(
      "The workspace could not be saved.",
    );
  }

  return mapWorkspaceRow(row);
}