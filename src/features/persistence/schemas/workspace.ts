import { z } from "zod";

import { careerRoles } from
  "@/features/goals/data/career-roles";

const courseProgressSchema = z.enum([
  "completed",
  "in-progress",
  "planned",
]);

const experienceProgressSchema = z.enum([
  "completed",
  "in-progress",
]);

const skillProgressSchema = z.enum([
  "demonstrated",
  "developing",
]);

const studentCourseSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1).max(120),
  description: z
    .string()
    .trim()
    .max(500)
    .optional(),

  status: courseProgressSchema,

  skillIds: z.array(
    z.string().trim().min(1),
  ),
});

const studentExperienceSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1).max(120),
  description: z
    .string()
    .trim()
    .max(500)
    .optional(),

  status: experienceProgressSchema,

  skillIds: z.array(
    z.string().trim().min(1),
  ),
});

const studentSkillSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).max(80),
  status: skillProgressSchema,
});

export const studentProfileSchema =
  z.object({
    id: z.string().trim().min(1),
    name: z.string().trim().min(1).max(120),

    program: z
      .string()
      .trim()
      .max(160)
      .optional(),

    courses: z.array(
      studentCourseSchema,
    ),

    experiences: z.array(
      studentExperienceSchema,
    ),

    skills: z.array(
      studentSkillSchema,
    ),
  });

const validRoleIds = new Set(
  careerRoles.map((role) => role.id),
);

export const workspaceIdSchema = z
  .string()
  .uuid();

export const workspaceSnapshotSchema =
  z.object({
    version: z.literal(1),

    profile: studentProfileSchema,

    selectedRoleId: z
      .string()
      .min(1)
      .refine(
        (roleId) =>
          validRoleIds.has(roleId),
        {
          message:
            "The selected career role is not supported.",
        },
      ),
  });