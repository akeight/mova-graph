import { randomUUID } from "node:crypto";

import { and, eq, isNotNull, sql } from "drizzle-orm";

import { db } from "@/lib/db/index";
import { studentWorkspaces } from "@/lib/db/schema/student-workspaces";

import { storedWorkspaceSnapshotSchema } from
  "../schemas/workspace";

import type {
  PersistedWorkspace,
  WorkspaceSnapshot,
} from "../types/workspace";

type WorkspaceRow = typeof studentWorkspaces.$inferSelect;

function mapWorkspaceRow(
  row: WorkspaceRow,
): PersistedWorkspace {
  const snapshot =
    storedWorkspaceSnapshotSchema.parse({
      version: row.version,
      profile: row.profile,
      selectedRoleId: row.selectedRoleId,
      onboarding: {
        completed: row.onboardingCompleted,
        step: row.onboardingStep ?? "career-goal",
      },
    });

  return {
    id: row.id,
    ...snapshot,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** The owner id of a workspace, or null for a legacy anonymous workspace. */
export async function getWorkspaceOwnerId(
  workspaceId: string,
): Promise<{ found: boolean; ownerId: string | null }> {
  const [row] = await db
    .select({ userId: studentWorkspaces.userId })
    .from(studentWorkspaces)
    .where(eq(studentWorkspaces.id, workspaceId))
    .limit(1);

  if (!row) {
    return { found: false, ownerId: null };
  }

  return { found: true, ownerId: row.userId };
}

export async function getWorkspaceById(
  workspaceId: string,
): Promise<PersistedWorkspace | null> {
  const [row] = await db
    .select()
    .from(studentWorkspaces)
    .where(eq(studentWorkspaces.id, workspaceId))
    .limit(1);

  return row ? mapWorkspaceRow(row) : null;
}

export async function getWorkspaceByUserId(
  userId: string,
): Promise<PersistedWorkspace | null> {
  const [row] = await db
    .select()
    .from(studentWorkspaces)
    .where(eq(studentWorkspaces.userId, userId))
    .limit(1);

  return row ? mapWorkspaceRow(row) : null;
}

/**
 * Upserts the authenticated user's single workspace, keyed by `user_id`.
 * The workspace id is never taken from the browser.
 */
export async function saveWorkspaceForUser(
  userId: string,
  snapshot: WorkspaceSnapshot,
): Promise<PersistedWorkspace> {
  const now = new Date();

  const [row] = await db
    .insert(studentWorkspaces)
    .values({
      id: randomUUID(),
      userId,
      version: snapshot.version,
      selectedRoleId: snapshot.selectedRoleId,
      profile: snapshot.profile,
      onboardingCompleted: snapshot.onboarding.completed,
      onboardingStep: snapshot.onboarding.step,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: studentWorkspaces.userId,
      targetWhere: isNotNull(studentWorkspaces.userId),

      set: {
        version: snapshot.version,
        selectedRoleId: snapshot.selectedRoleId,
        profile: snapshot.profile,
        onboardingCompleted: snapshot.onboarding.completed,
        onboardingStep: snapshot.onboarding.step,
        updatedAt: now,
      },
    })
    .returning();

  if (!row) {
    throw new Error("The workspace could not be saved.");
  }

  return mapWorkspaceRow(row);
}

/**
 * Assigns ownership of an unowned workspace to a user. The update is guarded
 * so it can never steal a workspace that already has an owner.
 */
export async function assignWorkspaceOwner(
  workspaceId: string,
  userId: string,
): Promise<PersistedWorkspace | null> {
  const [row] = await db
    .update(studentWorkspaces)
    .set({ userId })
    .where(
      and(
        eq(studentWorkspaces.id, workspaceId),
        sql`${studentWorkspaces.userId} is null`,
      ),
    )
    .returning();

  return row ? mapWorkspaceRow(row) : null;
}
