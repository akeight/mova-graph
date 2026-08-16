"use client";

import { useState } from "react";

import {
  BookOpen,
  BriefcaseBusiness,
  Check,
  LoaderCircle,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type {
  CourseProgress,
  ExperienceProgress,
} from "@/features/student-profile/types/student-profile";

import type {
  ApprovedProfileItem,
  ProfileItemExtraction,
  ProfileItemKind,
} from "../types/profile-item-extraction";

type ProfileExtractionReviewProps = {
  onAdd: (
    item: ApprovedProfileItem,
  ) => void;
};

type ApiErrorResponse = {
  error?: string;
};

const MINIMUM_TEXT_LENGTH = 20;

export function ProfileExtractionReview({
  onAdd,
}: ProfileExtractionReviewProps) {
  const [kind, setKind] =
    useState<ProfileItemKind>(
      "experience",
    );

  const [sourceText, setSourceText] =
    useState("");

  const [extraction, setExtraction] =
    useState<ProfileItemExtraction | null>(
      null,
    );

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [
    selectedSkillIds,
    setSelectedSkillIds,
  ] = useState<string[]>([]);

  const [courseStatus, setCourseStatus] =
    useState<CourseProgress>(
      "completed",
    );

  const [
    experienceStatus,
    setExperienceStatus,
  ] = useState<ExperienceProgress>(
    "completed",
  );

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const selectedSkills =
    extraction?.skills.filter((skill) =>
      selectedSkillIds.includes(
        skill.id,
      ),
    ) ?? [];

  const resetExtraction = () => {
    setExtraction(null);
    setTitle("");
    setDescription("");
    setSelectedSkillIds([]);
    setError(null);
  };

  const handleKindChange = (
    nextKind: ProfileItemKind,
  ) => {
    setKind(nextKind);
    resetExtraction();
  };

  const handleAnalyze = async () => {
    const text = sourceText.trim();

    if (
      text.length <
      MINIMUM_TEXT_LENGTH
    ) {
      setError(
        "Add a little more detail before asking Mova to analyze it.",
      );

      return;
    }

    setIsAnalyzing(true);
    setError(null);
    resetExtraction();

    try {
      const response = await fetch(
        "/api/ai/extract-profile-item",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            kind,
            text,
          }),
        },
      );

      const payload:
        | ProfileItemExtraction
        | ApiErrorResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          "error" in payload &&
          payload.error
            ? payload.error
            : "Mova could not analyze that description.",
        );
      }

      const result =
        payload as ProfileItemExtraction;

      setExtraction(result);
      setTitle(result.title);
      setDescription(
        result.description,
      );

      setSelectedSkillIds(
        result.skills.map(
          (skill) => skill.id,
        ),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Mova could not analyze that description.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSkill = (
    skillId: string,
  ) => {
    setSelectedSkillIds(
      (currentSkillIds) =>
        currentSkillIds.includes(skillId)
          ? currentSkillIds.filter(
              (currentSkillId) =>
                currentSkillId !==
                skillId,
            )
          : [
              ...currentSkillIds,
              skillId,
            ],
    );
  };

  const handleAdd = () => {
    if (
      !extraction ||
      !title.trim() ||
      selectedSkills.length === 0
    ) {
      return;
    }

    const sharedItem = {
      title: title.trim(),

      description:
        description.trim() ||
        undefined,

      skills: selectedSkills,
    };

    if (kind === "course") {
      onAdd({
        ...sharedItem,
        kind: "course",
        status: courseStatus,
      });
    } else {
      onAdd({
        ...sharedItem,
        kind: "experience",
        status: experienceStatus,
      });
    }

    setSourceText("");
    resetExtraction();
    setCourseStatus("completed");
    setExperienceStatus(
      "completed",
    );
  };

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <WandSparkles
            className="h-5 w-5"
            aria-hidden="true"
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            AI profile assistant
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Turn your work into profile evidence
          </h2>

          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Paste a course, project, internship, or activity
            description. Review every suggestion before adding
            it to your profile.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="space-y-4">
          <div
            className="grid grid-cols-2 gap-2"
            role="group"
            aria-label="Profile item type"
          >
            <button
              type="button"
              onClick={() =>
                handleKindChange(
                  "course",
                )
              }
              aria-pressed={
                kind === "course"
              }
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",

                kind === "course"
                  ? "border-category-course/50 bg-category-course/10 text-category-course"
                  : "hover:bg-muted",
              )}
            >
              <BookOpen
                className="h-4 w-4"
                aria-hidden="true"
              />
              Course
            </button>

            <button
              type="button"
              onClick={() =>
                handleKindChange(
                  "experience",
                )
              }
              aria-pressed={
                kind === "experience"
              }
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",

                kind ===
                  "experience"
                  ? "border-category-experience/50 bg-category-experience/10 text-category-experience"
                  : "hover:bg-muted",
              )}
            >
              <BriefcaseBusiness
                className="h-4 w-4"
                aria-hidden="true"
              />
              Experience
            </button>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium">
              What did you learn or build?
            </span>

            <textarea
              value={sourceText}
              onChange={(event) =>
                setSourceText(
                  event.target.value,
                )
              }
              rows={8}
              maxLength={5_000}
              placeholder={
                kind === "course"
                  ? "Paste a course description, syllabus summary, or describe the work you completed..."
                  : "Describe a project, internship, job, club, or activity and what you contributed..."
              }
              className="w-full resize-y rounded-xl border bg-background px-3 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
            />

            <span className="block text-right text-xs text-muted-foreground">
              {sourceText.length}/5,000
            </span>
          </label>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={
              isAnalyzing ||
              sourceText.trim().length <
                MINIMUM_TEXT_LENGTH
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <LoaderCircle
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Analyzing…
              </>
            ) : (
              <>
                <Sparkles
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                Analyze with Mova
              </>
            )}
          </button>

          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </div>
          ) : null}
        </div>

        <div className="min-w-0">
          {!extraction ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed bg-muted/20 p-6 text-center">
              <div>
                <Sparkles
                  className="mx-auto h-8 w-8 text-muted-foreground"
                  aria-hidden="true"
                />

                <h3 className="mt-3 font-semibold">
                  Review suggestions here
                </h3>

                <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Mova will suggest a title, description, and
                  evidence-backed skills. Nothing is added
                  automatically.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 rounded-xl border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    Review before adding
                  </p>

                  <h3 className="mt-1 font-semibold">
                    Mova found{" "}
                    {
                      extraction.skills
                        .length
                    }{" "}
                    possible skills
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={
                    resetExtraction
                  }
                  aria-label="Discard extraction"
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
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>

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
                  maxLength={400}
                  className="w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium">
                  Progress
                </span>

                {kind === "course" ? (
                  <select
                    value={courseStatus}
                    onChange={(event) =>
                      setCourseStatus(
                        event.target
                          .value as CourseProgress,
                      )
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
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
                ) : (
                  <select
                    value={
                      experienceStatus
                    }
                    onChange={(event) =>
                      setExperienceStatus(
                        event.target
                          .value as ExperienceProgress,
                      )
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  >
                    <option value="completed">
                      Completed
                    </option>

                    <option value="in-progress">
                      In progress
                    </option>
                  </select>
                )}
              </label>

              <fieldset className="space-y-3">
                <legend className="text-xs font-medium">
                  Approve skills
                </legend>

                {extraction.skills.map(
                  (skill) => {
                    const isSelected =
                      selectedSkillIds.includes(
                        skill.id,
                      );

                    return (
                      <label
                        key={skill.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",

                          isSelected
                            ? "border-primary/40 bg-primary/8"
                            : "hover:bg-muted/50",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={
                            isSelected
                          }
                          onChange={() =>
                            toggleSkill(
                              skill.id,
                            )
                          }
                          className="sr-only"
                        />

                        <span
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",

                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/40",
                          )}
                        >
                          {isSelected ? (
                            <Check
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          ) : null}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-semibold">
                              {
                                skill.name
                              }
                            </span>

                            <span className="rounded-full border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                              {Math.round(
                                skill.confidence *
                                  100,
                              )}
                              % confidence
                            </span>
                          </span>

                          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                            {
                              skill.evidence
                            }
                          </span>
                        </span>
                      </label>
                    );
                  },
                )}
              </fieldset>

              <button
                type="button"
                onClick={handleAdd}
                disabled={
                  !title.trim() ||
                  selectedSkills.length ===
                    0
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Add approved{" "}
                {kind === "course"
                  ? "course"
                  : "experience"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}