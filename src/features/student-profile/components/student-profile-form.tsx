"use client";

import { useState } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  RotateCcw,
  Trash2,
} from "lucide-react";

import type {
  CourseProgress,
  ExperienceProgress,
  StudentProfile,
  StudentSkill,
} from "../types/student-profile";
import { reconcileProfileSkills } from
  "../utils/reconcile-profile-skills";

type StudentProfileFormProps = {
  profile: StudentProfile;
  onChange: (profile: StudentProfile) => void;
  onRestoreDemo: () => void;
};

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function createSkillId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseSkillNames(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    ),
  );
}

function mergeSkills(
  currentSkills: StudentSkill[],
  skillNames: string[],
  status: StudentSkill["status"],
): StudentSkill[] {
  const skills = new Map(
    currentSkills.map((skill) => [skill.id, skill]),
  );

  for (const name of skillNames) {
    const id = createSkillId(name);
    const existingSkill = skills.get(id);

    skills.set(id, {
      id,
      name,
      status:
        existingSkill?.status === "demonstrated" ||
        status === "demonstrated"
          ? "demonstrated"
          : "developing",
    });
  }

  return Array.from(skills.values());
}

export function StudentProfileForm({
  profile,
  onChange,
  onRestoreDemo,
}: StudentProfileFormProps) {
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseStatus, setCourseStatus] =
    useState<CourseProgress>("completed");
  const [courseSkills, setCourseSkills] = useState("");

  const [experienceTitle, setExperienceTitle] = useState("");
  const [experienceDescription, setExperienceDescription] = useState("");
  const [experienceStatus, setExperienceStatus] =
    useState<ExperienceProgress>("completed");
  const [experienceSkills, setExperienceSkills] = useState("");

  const addCourse = () => {
    const skillNames = parseSkillNames(courseSkills);

    if (!courseTitle.trim() || skillNames.length === 0) {
      return;
    }

    const skillIds = skillNames.map(createSkillId);

    onChange({
      ...profile,
      courses: [
        ...profile.courses,
        {
          id: createId("course"),
          title: courseTitle.trim(),
          description: courseDescription.trim() || undefined,
          status: courseStatus,
          skillIds,
        },
      ],
      skills: mergeSkills(
        profile.skills,
        skillNames,
        courseStatus === "completed"
          ? "demonstrated"
          : "developing",
      ),
    });

    setCourseTitle("");
    setCourseDescription("");
    setCourseSkills("");
    setCourseStatus("completed");
  };

  const addExperience = () => {
    const skillNames = parseSkillNames(experienceSkills);

    if (!experienceTitle.trim() || skillNames.length === 0) {
      return;
    }

    const skillIds = skillNames.map(createSkillId);

    onChange({
      ...profile,
      experiences: [
        ...profile.experiences,
        {
          id: createId("experience"),
          title: experienceTitle.trim(),
          description: experienceDescription.trim() || undefined,
          status: experienceStatus,
          skillIds,
        },
      ],
      skills: mergeSkills(
        profile.skills,
        skillNames,
        experienceStatus === "completed"
          ? "demonstrated"
          : "developing",
      ),
    });

    setExperienceTitle("");
    setExperienceDescription("");
    setExperienceSkills("");
    setExperienceStatus("completed");
  };

  const removeCourse = (courseId: string) => {
    const updatedProfile: StudentProfile = {
      ...profile,
      courses: profile.courses.filter(
        (course) => course.id !== courseId,
      ),
    };
  
    onChange(
      reconcileProfileSkills(updatedProfile),
    );
  };

  const removeExperience = (
    experienceId: string,
  ) => {
    const updatedProfile: StudentProfile = {
      ...profile,
      experiences: profile.experiences.filter(
        (experience) =>
          experience.id !== experienceId,
      ),
    };
  
    onChange(
      reconcileProfileSkills(updatedProfile),
    );
  };

  return (
    <aside className="space-y-6 rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">Student profile</h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Add what you have completed and what you are building.
          </p>
        </div>

        <button
          type="button"
          onClick={onRestoreDemo}
          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Demo
        </button>
      </div>

      <div className="space-y-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium">Name</span>

          <input
            value={profile.name}
            onChange={(event) => {
              onChange({
                ...profile,
                name: event.target.value,
              });
            }}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium">Academic program</span>

          <input
            value={profile.program ?? ""}
            onChange={(event) => {
              onChange({
                ...profile,
                program: event.target.value,
              });
            }}
            placeholder="B.S. Software Engineering"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>

      <div className="border-t pt-5">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold">Add a course</h3>
        </div>

        <div className="space-y-3">
          <input
            value={courseTitle}
            onChange={(event) => setCourseTitle(event.target.value)}
            placeholder="Course title"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />

          <textarea
            value={courseDescription}
            onChange={(event) =>
              setCourseDescription(event.target.value)
            }
            placeholder="Short description, optional"
            rows={2}
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm"
          />

          <select
            value={courseStatus}
            onChange={(event) =>
              setCourseStatus(event.target.value as CourseProgress)
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="completed">Completed</option>
            <option value="in-progress">In progress</option>
            <option value="planned">Planned</option>
          </select>

          <input
            value={courseSkills}
            onChange={(event) => setCourseSkills(event.target.value)}
            placeholder="Skills, separated by commas"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />

          <button
            type="button"
            onClick={addCourse}
            disabled={!courseTitle.trim() || !courseSkills.trim()}
            className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add course
          </button>
        </div>
      </div>

      <div className="border-t pt-5">
        <div className="mb-3 flex items-center gap-2">
          <BriefcaseBusiness className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold">
            Add an experience
          </h3>
        </div>

        <div className="space-y-3">
          <input
            value={experienceTitle}
            onChange={(event) =>
              setExperienceTitle(event.target.value)
            }
            placeholder="Project, internship, or activity"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />

          <textarea
            value={experienceDescription}
            onChange={(event) =>
              setExperienceDescription(event.target.value)
            }
            placeholder="What did you build or contribute?"
            rows={2}
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm"
          />

          <select
            value={experienceStatus}
            onChange={(event) =>
              setExperienceStatus(
                event.target.value as ExperienceProgress,
              )
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="completed">Completed</option>
            <option value="in-progress">In progress</option>
          </select>

          <input
            value={experienceSkills}
            onChange={(event) =>
              setExperienceSkills(event.target.value)
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
        <h3 className="text-sm font-semibold">
          Current profile
        </h3>

        {profile.courses.map((course) => (
          <div
            key={course.id}
            className="flex items-start justify-between gap-3 rounded-lg border p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {course.title}
              </p>

              <p className="mt-1 text-xs capitalize text-muted-foreground">
                Course · {course.status.replace("-", " ")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeCourse(course.id)}
              aria-label={`Remove ${course.title}`}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {profile.experiences.map((experience) => (
          <div
            key={experience.id}
            className="flex items-start justify-between gap-3 rounded-lg border p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {experience.title}
              </p>

              <p className="mt-1 text-xs capitalize text-muted-foreground">
                Experience · {experience.status.replace("-", " ")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeExperience(experience.id)}
              aria-label={`Remove ${experience.title}`}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}