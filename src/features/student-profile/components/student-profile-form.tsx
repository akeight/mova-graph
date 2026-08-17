"use client";

import { useState } from "react";

import {
  BookOpen,
  BriefcaseBusiness,
  RotateCcw,
} from "lucide-react";

import type {
  CourseProgress,
  ExperienceProgress,
  StudentProfile,
  StudentSkill,
} from "../types/student-profile";

import { SkillManagementPanel } from
  "./skill-management-panel";

import {
  getProfileItemSkillNames,
  removeProfileItem,
  updateProfileItem,
} from "../services/profile-item-service";

import {
  EditableProfileItemCard,
  type ProfileItemDraft,
} from "./editable-profile-item-card";

import { reconcileProfileSkills } from
  "../utils/reconcile-profile-skills";

import { PROFILE_ITEM_DESCRIPTION_MAX } from
  "../constants";

import { getSkillContributionStatus } from
  "../utils/profile-item-status";

import {
  normalizeEvidenceNames,
} from "@/features/goals/services/normalize-evidence";

type StudentProfileFormProps = {
  profile: StudentProfile;
  onChange: (profile: StudentProfile) => void;
  onRestoreDemo: () => void;
};

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function parseSkillInput(
  value: string,
) {
  return normalizeEvidenceNames(
    value
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean),
  );
}

function mergeNormalizedSkills(
  currentSkills: StudentSkill[],
  incomingSkills: Array<{
    id: string;
    name: string;
  }>,
  status: StudentSkill["status"],
): StudentSkill[] {
  const skills = new Map(
    currentSkills.map((skill) => [
      skill.id,
      skill,
    ]),
  );

  for (const incoming of incomingSkills) {
    const existingSkill =
      skills.get(incoming.id);

      skills.set(incoming.id, {
        id: incoming.id,
        name:
          existingSkill?.name ??
          incoming.name,

        status:
          existingSkill?.status ===
            "demonstrated" ||
          status === "demonstrated"
            ? "demonstrated"
            : "developing",

        ...(existingSkill?.selfReported
          ? { selfReported: true as const }
          : {}),
      });
  }

  return Array.from(
    skills.values(),
  );
}

export function StudentProfileForm({
  profile,
  onChange,
  onRestoreDemo,
}: StudentProfileFormProps) {
  const [
    courseTitle,
    setCourseTitle,
  ] = useState("");

  const [
    courseDescription,
    setCourseDescription,
  ] = useState("");

  const [
    courseStatus,
    setCourseStatus,
  ] = useState<CourseProgress>(
    "completed",
  );

  const [
    courseSkills,
    setCourseSkills,
  ] = useState("");

  const [
    experienceTitle,
    setExperienceTitle,
  ] = useState("");

  const [
    experienceDescription,
    setExperienceDescription,
  ] = useState("");

  const [
    experienceStatus,
    setExperienceStatus,
  ] = useState<ExperienceProgress>(
    "completed",
  );

  const [
    experienceSkills,
    setExperienceSkills,
  ] = useState("");

  const addCourse = () => {
    const normalizedSkills =
      parseSkillInput(courseSkills);

    if (
      !courseTitle.trim() ||
      normalizedSkills.length === 0
    ) {
      return;
    }

    const skillIds =
      normalizedSkills.map(
        (skill) => skill.id,
      );

    const contributionStatus =
      getSkillContributionStatus(
        courseStatus,
      );

    const updatedProfile: StudentProfile = {
      ...profile,

      courses: [
        ...profile.courses,
        {
          id: createId("course"),
          title:
            courseTitle.trim(),

          description:
            courseDescription.trim() ||
            undefined,

          status: courseStatus,
          skillIds,
        },
      ],

      skills: contributionStatus
        ? mergeNormalizedSkills(
            profile.skills,
            normalizedSkills,
            contributionStatus,
          )
        : profile.skills,
    };

    onChange(
      reconcileProfileSkills(
        updatedProfile,
      ),
    );

    setCourseTitle("");
    setCourseDescription("");
    setCourseSkills("");
    setCourseStatus("completed");
  };

  const addExperience = () => {
    const normalizedSkills =
      parseSkillInput(
        experienceSkills,
      );

    if (
      !experienceTitle.trim() ||
      normalizedSkills.length === 0
    ) {
      return;
    }

    const skillIds =
      normalizedSkills.map(
        (skill) => skill.id,
      );

    const contributionStatus =
      getSkillContributionStatus(
        experienceStatus,
      );

    const updatedProfile: StudentProfile = {
      ...profile,

      experiences: [
        ...profile.experiences,
        {
          id: createId(
            "experience",
          ),

          title:
            experienceTitle.trim(),

          description:
            experienceDescription.trim() ||
            undefined,

          status:
            experienceStatus,

          skillIds,
        },
      ],

      skills: contributionStatus
        ? mergeNormalizedSkills(
            profile.skills,
            normalizedSkills,
            contributionStatus,
          )
        : profile.skills,
    };

    onChange(
      reconcileProfileSkills(
        updatedProfile,
      ),
    );

    setExperienceTitle("");
    setExperienceDescription("");
    setExperienceSkills("");
    setExperienceStatus(
      "completed",
    );
  };

  const handleCourseSave = (
    courseId: string,
    draft: ProfileItemDraft,
  ) => {
    onChange(
      updateProfileItem(profile, {
        kind: "course",
        itemId: courseId,
        title: draft.title,
        description:
          draft.description,

        status:
          draft.status as CourseProgress,

        skillNames:
          draft.skillNames,
      }),
    );
  };

  const handleExperienceSave = (
    experienceId: string,
    draft: ProfileItemDraft,
  ) => {
    onChange(
      updateProfileItem(profile, {
        kind: "experience",
        itemId: experienceId,
        title: draft.title,
        description:
          draft.description,

        status:
          draft.status as ExperienceProgress,

        skillNames:
          draft.skillNames,
        organization: draft.organization,
        startDate: draft.startDate,
        endDate: draft.endDate,
      }),
    );
  };

  const handleItemDelete = (
    kind: "course" | "experience",
    itemId: string,
  ) => {
    onChange(
      removeProfileItem(
        profile,
        kind,
        itemId,
      ),
    );
  };

  return (
    <aside className="space-y-6 rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">
            Student profile
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Add and manage what you have completed,
            what you are building, and what you plan
            to pursue.
          </p>
        </div>

        <button
          type="button"
          onClick={onRestoreDemo}
          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
        >
          <RotateCcw
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />

          Load example
        </button>
      </div>

      <div className="space-y-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium">
            Name
          </span>

          <input
            value={profile.name}
            onChange={(event) => {
              onChange({
                ...profile,
                name:
                  event.target.value,
              });
            }}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium">
            Academic program
          </span>

          <input
            value={
              profile.program ?? ""
            }
            onChange={(event) => {
              onChange({
                ...profile,

                program:
                  event.target.value,
              });
            }}
            placeholder="B.S. Software Engineering"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium">
            Institution
          </span>

          <input
            value={
              profile.institution ?? ""
            }
            onChange={(event) => {
              onChange({
                ...profile,
                institution:
                  event.target.value,
              });
            }}
            placeholder="State University"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>

      <div className="border-t pt-5">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen
            className="h-4 w-4 text-category-course"
            aria-hidden="true"
          />

          <h3 className="text-sm font-semibold">
            Add a course
          </h3>
        </div>

        <div className="space-y-3">
          <input
            value={courseTitle}
            onChange={(event) =>
              setCourseTitle(
                event.target.value,
              )
            }
            placeholder="Course title"
            maxLength={120}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />

          <textarea
            value={
              courseDescription
            }
            onChange={(event) =>
              setCourseDescription(
                event.target.value,
              )
            }
            placeholder="Short description, optional"
            rows={2}
            maxLength={PROFILE_ITEM_DESCRIPTION_MAX}
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm"
          />

          <select
            value={courseStatus}
            onChange={(event) =>
              setCourseStatus(
                event.target
                  .value as CourseProgress,
              )
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="completed">
              Completed
            </option>

            <option value="in-progress">
              In progress
            </option>

            <option value="planned">
              Planned
            </option>
          </select>

          <input
            value={courseSkills}
            onChange={(event) =>
              setCourseSkills(
                event.target.value,
              )
            }
            placeholder="Skills, separated by commas"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />

          <button
            type="button"
            onClick={addCourse}
            disabled={
              !courseTitle.trim() ||
              !courseSkills.trim()
            }
            className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add course
          </button>
        </div>
      </div>

      <div className="border-t pt-5">
        <div className="mb-3 flex items-center gap-2">
          <BriefcaseBusiness
            className="h-4 w-4 text-category-experience"
            aria-hidden="true"
          />

          <h3 className="text-sm font-semibold">
            Add an experience
          </h3>
        </div>

        <div className="space-y-3">
          <input
            value={experienceTitle}
            onChange={(event) =>
              setExperienceTitle(
                event.target.value,
              )
            }
            placeholder="Project, internship, or activity"
            maxLength={120}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />

          <textarea
            value={
              experienceDescription
            }
            onChange={(event) =>
              setExperienceDescription(
                event.target.value,
              )
            }
            placeholder="What did you build or contribute?"
            rows={2}
            maxLength={PROFILE_ITEM_DESCRIPTION_MAX}
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm"
          />

          <select
            value={experienceStatus}
            onChange={(event) =>
              setExperienceStatus(
                event.target
                  .value as ExperienceProgress,
              )
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="completed">
              Completed
            </option>

            <option value="in-progress">
              In progress
            </option>

            <option value="planned">
              Planned
            </option>
          </select>

          <input
            value={experienceSkills}
            onChange={(event) =>
              setExperienceSkills(
                event.target.value,
              )
            }
            placeholder="Skills, separated by commas"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />

          <button
            type="button"
            onClick={addExperience}
            disabled={
              !experienceTitle.trim() ||
              !experienceSkills.trim()
            }
            className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add experience
          </button>
        </div>
      </div>

      <div className="space-y-3 border-t pt-5">
        <div>
          <h3 className="text-sm font-semibold">
            Current profile
          </h3>

          <p className="mt-1 text-xs text-muted-foreground">
            Edit, drop, restore, or permanently
            remove saved profile items.
          </p>
        </div>

        {profile.courses.length === 0 &&
        profile.experiences.length ===
          0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-xs text-muted-foreground">
              No courses or experiences have
              been added yet.
            </p>
          </div>
        ) : null}

        {profile.courses.map(
          (course) => (
            <EditableProfileItemCard
              key={course.id}
              kind="course"
              item={course}
              skillNames={getProfileItemSkillNames(
                profile,
                course.skillIds,
              )}
              onSave={(draft) =>
                handleCourseSave(
                  course.id,
                  draft,
                )
              }
              onDelete={() =>
                handleItemDelete(
                  "course",
                  course.id,
                )
              }
            />
          ),
        )}

        {profile.experiences.map(
          (experience) => (
            <EditableProfileItemCard
              key={experience.id}
              kind="experience"
              item={experience}
              skillNames={getProfileItemSkillNames(
                profile,
                experience.skillIds,
              )}
              onSave={(draft) =>
                handleExperienceSave(
                  experience.id,
                  draft,
                )
              }
              onDelete={() =>
                handleItemDelete(
                  "experience",
                  experience.id,
                )
              }
            />
          ),
        )}
      </div>
      <SkillManagementPanel
        profile={profile}
        onChange={onChange}
      />
    </aside>
  );
}