import { z } from "zod";

import { careerRoles } from
  "@/features/goals/data/career-roles";
import { ONBOARDING_STEPS } from
  "@/features/onboarding/types/onboarding";

  const courseProgressSchema = z.enum([
    "planned",
    "in-progress",
    "completed",
    "dropped",
  ]);
  
  const experienceProgressSchema = z.enum([
    "planned",
    "in-progress",
    "completed",
    "dropped",
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

export const onboardingStepSchema = z.enum(
  ONBOARDING_STEPS,
);

export const onboardingStateSchema =
  z.object({
    completed: z.boolean(),
    step: onboardingStepSchema,
  });

const selectedRoleIdSchema = z
  .string()
  .min(1)
  .refine(
    (roleId) => validRoleIds.has(roleId),
    {
      message:
        "The selected career role is not supported.",
    },
  );

/**
 * Canonical (version 2) snapshot. Used to validate writes and normalized
 * reads. Onboarding metadata is required here.
 */
export const workspaceSnapshotSchema =
  z.object({
    version: z.literal(2),

    profile: studentProfileSchema,

    selectedRoleId: selectedRoleIdSchema,

    onboarding: onboardingStateSchema,
  });

const defaultOnboarding = {
  completed: false,
  step: "career-goal" as const,
};

/**
 * Accepts a version 1 or version 2 snapshot object and normalizes it to the
 * canonical version 2 shape, defaulting onboarding metadata for legacy data.
 */
export const storedWorkspaceSnapshotSchema = z
  .object({
    version: z.union([
      z.literal(1),
      z.literal(2),
    ]),

    profile: studentProfileSchema,

    selectedRoleId: selectedRoleIdSchema,

    onboarding: onboardingStateSchema.optional(),
  })
  .transform((snapshot) => ({
    version: 2 as const,
    profile: snapshot.profile,
    selectedRoleId: snapshot.selectedRoleId,
    onboarding:
      snapshot.onboarding ?? defaultOnboarding,
  }));