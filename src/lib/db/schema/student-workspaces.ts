import { sql } from "drizzle-orm";
import {
    boolean,
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
  } from "drizzle-orm/pg-core";
  
  import type { StudentProfile } from
    "@/features/student-profile/types/student-profile";
  
  export const studentWorkspaces =
    pgTable("student_workspaces", {
      id: uuid("id").primaryKey(),
  
      /*
       * Owner of this workspace, set to the verified Supabase user id.
       * Nullable so pre-auth anonymous workspaces remain claimable.
       */
      userId: uuid("user_id"),
  
      version: integer("version")
        .notNull()
        .default(1),
  
      selectedRoleId:
        text("selected_role_id")
          .notNull(),
  
      profile: jsonb("profile")
        .$type<StudentProfile>()
        .notNull(),
  
      onboardingCompleted:
        boolean("onboarding_completed")
          .notNull()
          .default(false),
  
      onboardingStep:
        text("onboarding_step"),
  
      createdAt: timestamp(
        "created_at",
        {
          withTimezone: true,
        },
      )
        .defaultNow()
        .notNull(),
  
      updatedAt: timestamp(
        "updated_at",
        {
          withTimezone: true,
        },
      )
        .defaultNow()
        .notNull(),
    }, (table) => [
      /*
       * At most one workspace per authenticated user. The partial predicate
       * lets legacy anonymous rows (user_id IS NULL) coexist.
       */
      uniqueIndex("student_workspaces_user_id_unique")
        .on(table.userId)
        .where(sql`${table.userId} is not null`),
    ]);
  
  export type StudentWorkspaceRow =
    typeof studentWorkspaces.$inferSelect;
  
  export type NewStudentWorkspaceRow =
    typeof studentWorkspaces.$inferInsert;