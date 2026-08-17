"use client";

import { useState } from "react";

import {
  Archive,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type {
  CourseProgress,
  ExperienceProgress,
  StudentCourse,
  StudentExperience,
} from "../types/student-profile";

import {
  PROFILE_ITEM_DATE_PATTERN,
  PROFILE_ITEM_DESCRIPTION_MAX,
  PROFILE_ORGANIZATION_MAX,
} from "../constants";

type EditableItem =
  | StudentCourse
  | StudentExperience;

type EditableProgress =
  | CourseProgress
  | ExperienceProgress;

export type ProfileItemDraft = {
  title: string;
  description?: string;
  status: EditableProgress;
  skillNames: string[];
  organization?: string;
  startDate?: string;
  endDate?: string;
};

type EditableProfileItemCardProps = {
  kind: "course" | "experience";
  item: EditableItem;
  skillNames: string[];

  onSave: (
    draft: ProfileItemDraft,
  ) => void;

  onDelete: () => void;
};

const statusLabels: Record<
  EditableProgress,
  string
> = {
  completed: "Completed",
  "in-progress": "In progress",
  planned: "Planned",
  dropped: "Dropped",
};

function isDateDraftInput(value: string): boolean {
  return value === "" || /^\d{0,4}(-\d{0,2})?$/.test(value);
}

function activityTypeLabel(
  kind: "course" | "experience",
  item: EditableItem,
): string {
  if (kind === "course") {
    return "kind" in item && item.kind === "certification"
      ? "Certification"
      : "Course";
  }

  if (!("kind" in item) || !item.kind) {
    return "Experience";
  }

  switch (item.kind) {
    case "project":
      return "Project";
    case "volunteer":
      return "Volunteer";
    case "leadership":
      return "Leadership";
    case "work":
      return "Work";
    default:
      return "Experience";
  }
}

function isExperienceItem(
  kind: "course" | "experience",
  item: EditableItem,
): item is StudentExperience {
  return kind === "experience" && Boolean(item.id);
}

export function EditableProfileItemCard({
  kind,
  item,
  skillNames,
  onSave,
  onDelete,
}: EditableProfileItemCardProps) {
  const [isEditing, setIsEditing] =
    useState(false);

  const [title, setTitle] =
    useState(item.title);

  const [description, setDescription] =
    useState(item.description ?? "");

  const [status, setStatus] =
    useState<EditableProgress>(
      item.status,
    );

  const [skillsText, setSkillsText] =
    useState(skillNames.join(", "));

  const experience = isExperienceItem(kind, item);

  const [organization, setOrganization] =
    useState(experience ? item.organization ?? "" : "");

  const [startDate, setStartDate] =
    useState(experience ? item.startDate ?? "" : "");

  const [endDate, setEndDate] =
    useState(experience ? item.endDate ?? "" : "");

  const resetDraft = () => {
    setTitle(item.title);
    setDescription(
      item.description ?? "",
    );
    setStatus(item.status);
    setSkillsText(
      skillNames.join(", "),
    );
    setOrganization(
      isExperienceItem(kind, item)
        ? item.organization ?? ""
        : "",
    );
    setStartDate(
      isExperienceItem(kind, item)
        ? item.startDate ?? ""
        : "",
    );
    setEndDate(
      isExperienceItem(kind, item)
        ? item.endDate ?? ""
        : "",
    );
  };

  const startEditing = () => {
    resetDraft();
    setIsEditing(true);
  };

  const cancelEditing = () => {
    resetDraft();
    setIsEditing(false);
  };

  const handleSave = () => {
    const nextSkillNames =
      skillsText
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

    const datesValid =
      kind !== "experience" ||
      ((!startDate || PROFILE_ITEM_DATE_PATTERN.test(startDate)) &&
        (!endDate || PROFILE_ITEM_DATE_PATTERN.test(endDate)));

    if (
      !title.trim() ||
      nextSkillNames.length === 0 ||
      !datesValid
    ) {
      return;
    }

    onSave({
      title: title.trim(),

      description:
        description.trim() ||
        undefined,

      status,
      skillNames: nextSkillNames,
      ...(kind === "experience"
        ? {
            organization: organization.trim(),
            startDate: startDate.trim(),
            endDate: endDate.trim(),
          }
        : {}),
    });

    setIsEditing(false);
  };

  const handleDelete = () => {
    const shouldDelete =
      window.confirm(
        `Permanently delete "${item.title}"? This cannot be undone.`,
      );

    if (shouldDelete) {
      onDelete();
    }
  };

  if (isEditing) {
    return (
      <article className="space-y-3 rounded-xl border border-primary/40 bg-primary/8 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Editing {activityTypeLabel(kind, item).toLowerCase()}
          </p>

          <button
            type="button"
            onClick={cancelEditing}
            aria-label="Cancel editing"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium">
            Title
          </span>

          <input
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value,
              )
            }
            maxLength={120}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>

        {kind === "experience" ? (
          <>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium">
                Organization
              </span>

              <input
                value={organization}
                onChange={(event) =>
                  setOrganization(event.target.value)
                }
                maxLength={PROFILE_ORGANIZATION_MAX}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </label>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium">
                  Start
                </span>
                <input
                  value={startDate}
                  placeholder="YYYY or YYYY-MM"
                  onChange={(event) => {
                    const value = event.target.value;

                    if (isDateDraftInput(value)) {
                      setStartDate(value);
                    }
                  }}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium">
                  End
                </span>
                <input
                  value={endDate}
                  placeholder="YYYY or YYYY-MM"
                  onChange={(event) => {
                    const value = event.target.value;

                    if (isDateDraftInput(value)) {
                      setEndDate(value);
                    }
                  }}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </label>
            </div>
            {(startDate && !PROFILE_ITEM_DATE_PATTERN.test(startDate)) ||
            (endDate && !PROFILE_ITEM_DATE_PATTERN.test(endDate)) ? (
              <p className="text-xs text-destructive">
                Use YYYY or YYYY-MM, with months 01–12.
              </p>
            ) : null}
          </>
        ) : null}

        <label className="block space-y-1.5">
          <span className="text-xs font-medium">
            Description
          </span>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            rows={3}
            maxLength={PROFILE_ITEM_DESCRIPTION_MAX}
            className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium">
            Status
          </span>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target
                  .value as EditableProgress,
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

            <option value="dropped">
              Dropped
            </option>
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium">
            Linked skills
          </span>

          <input
            value={skillsText}
            onChange={(event) =>
              setSkillsText(
                event.target.value,
              )
            }
            placeholder="Skills separated by commas"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={
              !title.trim() ||
              !skillsText.trim() ||
              (kind === "experience" &&
                Boolean(
                  (startDate &&
                    !PROFILE_ITEM_DATE_PATTERN.test(startDate)) ||
                    (endDate &&
                      !PROFILE_ITEM_DATE_PATTERN.test(endDate)),
                ))
            }
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save
              className="h-4 w-4"
              aria-hidden="true"
            />

            Save changes
          </button>

          <button
            type="button"
            onClick={cancelEditing}
            className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </button>
        </div>
      </article>
    );
  }

  const isDropped =
    item.status === "dropped";

  return (
    <article
      className={cn(
        "rounded-xl border p-3",
        isDropped &&
          "border-dashed bg-muted/30 opacity-75",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="min-w-0 truncate text-sm font-medium">
              {item.title}
            </p>

            {isDropped ? (
              <Archive
                className="h-3.5 w-3.5 text-muted-foreground"
                aria-label="Dropped"
              />
            ) : null}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            {activityTypeLabel(kind, item)}
            {" · "}
            {statusLabels[item.status]}
            {isExperienceItem(kind, item) && item.organization
              ? ` · ${item.organization}`
              : ""}
            {isExperienceItem(kind, item) &&
            (item.startDate || item.endDate)
              ? ` · ${item.startDate ?? "?"}–${item.endDate ?? "Present"}`
              : ""}
          </p>

          {item.description ? (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap gap-1.5">
            {skillNames.map(
              (skillName) => (
                <span
                  key={skillName}
                  className="rounded-full border bg-background px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {skillName}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={startEditing}
            aria-label={`Edit ${item.title}`}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Pencil
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            aria-label={`Delete ${item.title}`}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </article>
  );
}