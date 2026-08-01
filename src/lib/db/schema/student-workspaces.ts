import {
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
    uuid,
  } from "drizzle-orm/pg-core";
  
  import type { StudentProfile } from
    "@/features/student-profile/types/student-profile";
  
  export const studentWorkspaces =
    pgTable("student_workspaces", {
      id: uuid("id").primaryKey(),
  
      version: integer("version")
        .notNull()
        .default(1),
  
      selectedRoleId:
        text("selected_role_id")
          .notNull(),
  
      profile: jsonb("profile")
        .$type<StudentProfile>()
        .notNull(),
  
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
    });
  
  export type StudentWorkspaceRow =
    typeof studentWorkspaces.$inferSelect;
  
  export type NewStudentWorkspaceRow =
    typeof studentWorkspaces.$inferInsert;