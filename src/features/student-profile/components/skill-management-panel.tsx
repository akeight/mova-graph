"use client";

import { useMemo, useState } from "react";

import {
  Archive,
  BookOpen,
  BriefcaseBusiness,
  Link2,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type { StudentProfile } from
  "../types/student-profile";

import {
  getManagedProfileSkills,
  removeProfileSkill,
  renameProfileSkill,
  type ManagedSkillStatus,
} from "../services/profile-skill-service";

type SkillManagementPanelProps = {
  profile: StudentProfile;

  onChange: (
    profile: StudentProfile,
  ) => void;
};

const statusConfig: Record<
  ManagedSkillStatus,
  {
    label: string;
    className: string;
  }
> = {
  demonstrated: {
    label: "Demonstrated",

    className:
      "border-success/30 bg-success/12 text-success",
  },

  developing: {
    label: "Developing",

    className:
      "border-warning/30 bg-warning/12 text-warning",
  },

  planned: {
    label: "Planned",

    className:
      "border-info/30 bg-info/12 text-info",
  },

  inactive: {
    label: "Inactive",

    className:
      "border-muted bg-muted text-muted-foreground",
  },
};

export function SkillManagementPanel({
  profile,
  onChange,
}: SkillManagementPanelProps) {
  const [editingSkillId, setEditingSkillId] =
    useState<string | null>(null);

  const [skillName, setSkillName] =
    useState("");

  const skills = useMemo(
    () =>
      getManagedProfileSkills(
        profile,
      ),
    [profile],
  );

  const startEditing = (
    skillId: string,
    currentName: string,
  ) => {
    setEditingSkillId(skillId);
    setSkillName(currentName);
  };

  const cancelEditing = () => {
    setEditingSkillId(null);
    setSkillName("");
  };

  const saveSkill = (
    skillId: string,
  ) => {
    if (!skillName.trim()) {
      return;
    }

    onChange(
      renameProfileSkill(
        profile,
        skillId,
        skillName,
      ),
    );

    cancelEditing();
  };

  const deleteSkill = (
    skillId: string,
    name: string,
  ) => {
    const shouldRemove =
      window.confirm(
        [
          `Remove "${name}"?`,
          "",
          "This will remove the skill from every linked course and experience.",
        ].join("\n"),
      );

    if (!shouldRemove) {
      return;
    }

    onChange(
      removeProfileSkill(
        profile,
        skillId,
      ),
    );

    if (
      editingSkillId === skillId
    ) {
      cancelEditing();
    }
  };

  return (
    <section className="space-y-3 border-t pt-5">
      <div>
        <h3 className="text-sm font-semibold">
          Skills
        </h3>

        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Rename incorrect skills, correct their
          mappings, or remove them from every linked
          profile item. Skill status is calculated
          from your evidence.
        </p>
      </div>

      {skills.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Add a course or experience to begin
            building your skill profile.
          </p>
        </div>
      ) : null}

      {skills.map((skill) => {
        const status =
          statusConfig[skill.status];

        const isEditing =
          editingSkillId === skill.id;

        if (isEditing) {
          return (
            <article
              key={skill.id}
              className="space-y-3 rounded-xl border border-primary/40 bg-primary/8 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Edit skill
                </p>

                <button
                  type="button"
                  onClick={cancelEditing}
                  aria-label="Cancel editing skill"
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
                  Skill name
                </span>

                <input
                  value={skillName}
                  onChange={(event) =>
                    setSkillName(
                      event.target.value,
                    )
                  }
                  maxLength={80}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>

              <div className="rounded-lg border bg-background/70 p-3">
                <p className="text-xs font-medium">
                  Changing this name also updates its
                  mapping.
                </p>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Renaming Unit Testing to Software
                  Testing will update all linked
                  evidence and merge it with an
                  existing Software Testing skill.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    saveSkill(skill.id)
                  }
                  disabled={!skillName.trim()}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Save skill
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

        return (
          <article
            key={skill.id}
            className={cn(
              "rounded-xl border p-3",

              skill.status ===
                "inactive" &&
                "border-dashed bg-muted/20",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">
                    {skill.name}
                  </p>

                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      status.className,
                    )}
                  >
                    {status.label}
                  </span>
                </div>

                <p className="mt-1 break-all text-[10px] text-muted-foreground">
                  {skill.id}
                </p>

                {skill.sources.length > 0 ? (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      <Link2
                        className="h-3 w-3"
                        aria-hidden="true"
                      />

                      Evidence
                    </div>

                    {skill.sources.map(
                      (source) => {
                        const SourceIcon =
                          source.kind ===
                          "course"
                            ? BookOpen
                            : BriefcaseBusiness;

                        return (
                          <div
                            key={[
                              source.kind,
                              source.itemId,
                            ].join("-")}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                          >
                            <SourceIcon
                              className="h-3.5 w-3.5 shrink-0"
                              aria-hidden="true"
                            />

                            <span className="min-w-0 flex-1 truncate">
                              {source.title}
                            </span>

                            {source.status ===
                            "dropped" ? (
                              <Archive
                                className="h-3.5 w-3.5 shrink-0"
                                aria-label="Dropped"
                              />
                            ) : (
                              <span className="shrink-0 capitalize">
                                {source.status.replace(
                                  "-",
                                  " ",
                                )}
                              </span>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    This skill is not currently linked
                    to profile evidence.
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    startEditing(
                      skill.id,
                      skill.name,
                    )
                  }
                  aria-label={`Edit ${skill.name}`}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Pencil
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    deleteSkill(
                      skill.id,
                      skill.name,
                    )
                  }
                  aria-label={`Remove ${skill.name}`}
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
      })}
    </section>
  );
}