"use client";

import { useMemo, useState } from "react";

import {
  FileUp,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PROFILE_ITEM_DATE_PATTERN,
  PROFILE_ITEM_DESCRIPTION_MAX,
} from "@/features/student-profile/constants";
import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";

import { ResumeDraftEvidenceEditor } from
  "./resume-draft-evidence-editor";
import {
  MAX_RESUME_SOURCES,
  MAX_RESUME_TEXT_CHARS,
} from "../constants";
import {
  applyResumeDraftToProfile,
  ResumeDraftApplyError,
} from "../services/apply-resume-draft-to-profile";
import {
  applyDuplicateDecision,
  mergeResumeDrafts,
} from "../services/merge-resume-drafts";
import {
  extractResumeSource,
  parseResumeFile,
} from "../services/resume-import-client";
import { canAddResumeSourceText } from
  "../services/resume-session-capacity";
import {
  createManualDraftSkill,
  isDirectDraftSkill,
} from "../services/resume-draft-skills";
import type {
  ResumeDraftItem,
  ResumeImportDraft,
  ResumeImportMode,
  ResumeItemKind,
} from "../types/resume-import";
import { isCourseKind } from "../types/resume-import";

type WizardStage =
  | "collect"
  | "analyzing"
  | "duplicates"
  | "review"
  | "missing";

type CollectedSource = {
  id: string;
  displayName: string;
  text: string;
};

type ResumeImportWizardProps = {
  baselineProfile: StudentProfile;
  mode: ResumeImportMode;
  onApproved: (profile: StudentProfile) => void;
  onCancel: () => void;
};

const ANALYSIS_STAGES = [
  "Reading your resumes...",
  "Finding experiences...",
  "Mapping evidence...",
  "Preparing your draft profile...",
] as const;

function createSourceId(): string {
  return crypto.randomUUID();
}

function isDateDraftInput(value: string): boolean {
  return value === "" || /^\d{0,4}(-\d{0,2})?$/.test(value);
}

function resumeItemTypeLabel(kind: ResumeDraftItem["kind"]): string {
  switch (kind) {
    case "course":
      return "Course";
    case "certification":
      return "Certification";
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

function existingDuplicateDisplay(
  profile: StudentProfile,
  itemId: string,
): { title: string; organization?: string; type: string } | null {
  const course = profile.courses.find((item) => item.id === itemId);

  if (course) {
    return {
      title: course.title,
      type: resumeItemTypeLabel(course.kind ?? "course"),
    };
  }

  const experience = profile.experiences.find((item) => item.id === itemId);

  if (experience) {
    return {
      title: experience.title,
      organization: experience.organization,
      type: resumeItemTypeLabel(experience.kind ?? "work"),
    };
  }

  return null;
}

export function ResumeImportWizard({
  baselineProfile,
  mode,
  onApproved,
  onCancel,
}: ResumeImportWizardProps) {
  const [stage, setStage] = useState<WizardStage>("collect");
  const [sources, setSources] = useState<CollectedSource[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [analysisIndex, setAnalysisIndex] = useState(0);
  const [draft, setDraft] = useState<ResumeImportDraft | null>(null);

  const sourceTotalChars = sources.reduce(
    (total, source) => total + source.text.length,
    0,
  );
  const canAnalyze =
    sources.length > 0 &&
    canAddResumeSourceText(0, sourceTotalChars).ok;

  const addParsedSource = (displayName: string, text: string) => {
    const clipped = text.slice(0, MAX_RESUME_TEXT_CHARS);

    if (sources.length >= MAX_RESUME_SOURCES) {
      setError(`You can add up to ${MAX_RESUME_SOURCES} resume sources.`);
      return;
    }

    const capacity = canAddResumeSourceText(sourceTotalChars, clipped.length);

    if (!capacity.ok) {
      setError(capacity.error);
      return;
    }

    setSources((current) => [
      ...current,
      {
        id: createSourceId(),
        displayName,
        text: clipped,
      },
    ]);
    setError(null);
  };

  const handleFile = async (fileList: FileList | null) => {
    const file = fileList?.[0];

    if (!file) {
      return;
    }

    setError(null);

    try {
      const parsed = await parseResumeFile(file);
      addParsedSource(parsed.displayName, parsed.text);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "We couldn't read that file. Try another file or paste your resume text.",
      );
    }
  };

  const handlePaste = () => {
    const text = pasteText.trim();

    if (text.length < 80) {
      setError("Paste a bit more resume text, or upload a file.");
      return;
    }

    addParsedSource("Pasted resume", text);
    setPasteText("");
    setError(null);
  };

  const analyze = async () => {
    if (sources.length === 0) {
      return;
    }

    setStage("analyzing");
    setAnalysisIndex(0);
    setError(null);

    try {
      const drafts: ResumeImportDraft[] = [];

      for (const [index, source] of sources.entries()) {
        setAnalysisIndex(Math.min(index, ANALYSIS_STAGES.length - 1));
        drafts.push(
          await extractResumeSource({
            sourceId: source.id,
            displayName: source.displayName,
            text: source.text,
          }),
        );
      }

      setAnalysisIndex(ANALYSIS_STAGES.length - 1);

      const merged = mergeResumeDrafts(drafts, baselineProfile);
      setDraft({
        ...merged,
        applyProposedName: mode === "onboarding" && Boolean(merged.proposedName),
        proposedName: merged.proposedName,
      });

      setStage(
        merged.possibleDuplicates.length > 0 ? "duplicates" : "review",
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Mova could not analyze that resume. Please try again.",
      );
      setStage("collect");
    }
  };

  const approve = () => {
    if (!draft) {
      return;
    }

    try {
      const nextProfile = applyResumeDraftToProfile(
        baselineProfile,
        draft,
        mode,
      );
      onApproved(nextProfile);
    } catch (caught) {
      setError(
        caught instanceof ResumeDraftApplyError
          ? caught.message
          : "The imported profile could not be saved.",
      );
    }
  };

  if (stage === "collect") {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold">Your resume sources</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add up to {MAX_RESUME_SOURCES} PDF or DOCX files, or paste text.
            MOVa will combine them into one profile draft.
          </p>
        </div>

        <ul className="space-y-2">
          {sources.map((source) => (
            <li
              key={source.id}
              className="flex items-center justify-between rounded-xl border bg-card px-3 py-2 text-sm"
            >
              <span>{source.displayName}</span>
              <span className="text-xs text-muted-foreground">Ready</span>
            </li>
          ))}
        </ul>

        {sources.length < MAX_RESUME_SOURCES ? (
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm hover:bg-muted/40">
            <FileUp className="h-4 w-4" aria-hidden="true" />
            Add another resume
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              onChange={(event) => {
                void handleFile(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        ) : null}

        <div className="space-y-2">
          <p className="text-xs font-medium">Paste resume text instead</p>
          <Textarea
            value={pasteText}
            onChange={(event) => setPasteText(event.target.value)}
            maxLength={MAX_RESUME_TEXT_CHARS}
            rows={6}
            placeholder="Paste your resume here"
          />
          <Button variant="outline" onClick={handlePaste}>
            Add pasted resume
          </Button>
        </div>

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        <div className="flex justify-between gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel import
          </Button>
          <Button disabled={!canAnalyze} onClick={() => void analyze()}>
            Analyze resumes
          </Button>
        </div>
      </div>
    );
  }

  if (stage === "analyzing") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm font-medium">
          {ANALYSIS_STAGES[analysisIndex]}
        </p>
      </div>
    );
  }

  if (!draft) {
    return null;
  }

  if (stage === "duplicates") {
    return (
      <DuplicateStage
        draft={draft}
        existingProfile={baselineProfile}
        error={error}
        onChange={setDraft}
        onContinue={() => setStage("review")}
        onCancel={onCancel}
      />
    );
  }

  if (stage === "missing") {
    return (
      <div className="space-y-4">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
        <ResumeMissingInner
          onAddSomething={() => setStage("review")}
          onLooksRight={approve}
          onCancel={onCancel}
        />
      </div>
    );
  }

  return (
    <DraftReviewStage
      draft={draft}
      mode={mode}
      error={error}
      onChange={setDraft}
      onContinue={() => setStage("missing")}
      onCancel={onCancel}
    />
  );
}

function ResumeMissingInner({
  onAddSomething,
  onLooksRight,
  onCancel,
}: {
  onAddSomething: () => void;
  onLooksRight: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Anything important missing?</h2>
        <p className="text-sm text-muted-foreground">
          Resumes are short. Add projects, courses, jobs, volunteer work,
          certifications, or other experience that shows what you&apos;ve
          actually done.
        </p>
      </div>
      <div className="flex flex-wrap justify-between gap-3">
        <Button variant="ghost" onClick={onCancel}>
          Cancel import
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onAddSomething}>
            Add something
          </Button>
          <Button onClick={onLooksRight}>My profile looks right</Button>
        </div>
      </div>
    </div>
  );
}

function DuplicateStage({
  draft,
  existingProfile,
  error,
  onChange,
  onContinue,
  onCancel,
}: {
  draft: ResumeImportDraft;
  existingProfile: StudentProfile;
  error: string | null;
  onChange: (draft: ResumeImportDraft) => void;
  onContinue: () => void;
  onCancel: () => void;
}) {
  const unresolved = draft.possibleDuplicates;
  const current = unresolved[0];

  if (!current) {
    return null;
  }
  const left = draft.items.find((item) => item.id === current.leftId);
  const right =
    draft.items.find((item) => item.id === current.rightId) ?? null;
  const existingDisplay = right
    ? null
    : existingDuplicateDisplay(existingProfile, current.rightId);

  const decide = (decision: "merge" | "keep-separate") => {
    const next = applyDuplicateDecision(
      draft,
      current.id,
      decision,
      existingProfile,
    );
    onChange(next);

    if (next.possibleDuplicates.length === 0) {
      onContinue();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">These may be the same experience</h2>
      <p className="text-sm text-muted-foreground">{current.reason}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <DuplicateCard item={left} />
        <DuplicateCard item={right} existing={existingDisplay} />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-wrap justify-between gap-3">
        <Button variant="ghost" onClick={onCancel}>
          Cancel import
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => decide("keep-separate")}
          >
            Keep separate
          </Button>
          <Button
            onClick={() => decide("merge")}
          >
            Merge
          </Button>
        </div>
      </div>
    </div>
  );
}

function DuplicateCard({
  item,
  existing,
}: {
  item: ResumeDraftItem | undefined | null;
  existing?: { title: string; organization?: string; type: string } | null;
}) {
  if (item) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {resumeItemTypeLabel(item.kind)}
        </p>
        <p className="mt-1 font-medium">{item.title}</p>
        {item.organization ? (
          <p className="text-xs text-muted-foreground">{item.organization}</p>
        ) : null}
      </div>
    );
  }

  if (existing) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {existing.type}
        </p>
        <p className="mt-1 font-medium">{existing.title}</p>
        {existing.organization ? (
          <p className="text-xs text-muted-foreground">
            {existing.organization}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4 text-sm text-muted-foreground">
      Existing profile item
    </div>
  );
}

function DraftReviewStage({
  draft,
  mode,
  error,
  onChange,
  onContinue,
  onCancel,
}: {
  draft: ResumeImportDraft;
  mode: ResumeImportMode;
  error: string | null;
  onChange: (draft: ResumeImportDraft) => void;
  onContinue: () => void;
  onCancel: () => void;
}) {
  const sections = useMemo(() => ({
    experience: draft.items.filter((item) => item.kind === "work" || item.kind === "other"),
    projects: draft.items.filter((item) => item.kind === "project" || item.kind === "volunteer" || item.kind === "leadership"),
    courses: draft.items.filter((item) => item.kind === "course"),
    certifications: draft.items.filter((item) => item.kind === "certification"),
  }), [draft.items]);

  const repeatedCount = draft.items.filter((item) => item.sourceIds.length > 1).length;

  const addItem = (kind: ResumeItemKind) => {
    onChange({
      ...draft,
      items: [
        ...draft.items,
        {
          id: crypto.randomUUID(),
          kind,
          title: kind === "course" ? "New course" : "New experience",
          status: "in-progress",
          skills: [],
          selectedSkillIds: [],
          sourceIds: [],
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">MOVa combined your experience</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We found information across {draft.sources.length} resume
          {draft.sources.length === 1 ? "" : "s"}. {draft.items.length} items
          {repeatedCount > 0
            ? `, ${repeatedCount} repeated across resume versions`
            : ""}
          .
        </p>
      </div>

      {mode === "onboarding" && draft.proposedName ? (
        <label className="block space-y-1.5">
          <span className="text-xs font-medium">Name</span>
          <Input
            value={draft.proposedName}
            onChange={(event) =>
              onChange({
                ...draft,
                proposedName: event.target.value,
                applyProposedName: true,
              })
            }
          />
        </label>
      ) : null}

      {mode === "later" && draft.proposedName ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.applyProposedName}
            onChange={(event) =>
              onChange({
                ...draft,
                applyProposedName: event.target.checked,
              })
            }
          />
          Use name from resume: {draft.proposedName}
        </label>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium">Program</span>
          <Input
            value={draft.program ?? ""}
            placeholder="B.S. Software Engineering"
            onChange={(event) =>
              onChange({
                ...draft,
                program: event.target.value,
              })
            }
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium">Institution</span>
          <Input
            value={draft.institution ?? ""}
            placeholder="State University"
            onChange={(event) =>
              onChange({
                ...draft,
                institution: event.target.value,
              })
            }
          />
        </label>
      </div>

      <ReviewSection title="Experience" items={sections.experience} draft={draft} onChange={onChange} />
      <ReviewSection title="Projects" items={sections.projects} draft={draft} onChange={onChange} />
      <ReviewSection title="Education / coursework" items={sections.courses} draft={draft} onChange={onChange} />
      <ReviewSection title="Certifications" items={sections.certifications} draft={draft} onChange={onChange} />

      <StandaloneSection draft={draft} onChange={onChange} />

      <div className="space-y-2">
        <p className="text-sm font-medium">
          Your resume doesn&apos;t tell the whole story.
        </p>
        <div className="flex flex-wrap gap-2">
          {([
            ["work", "Experience"],
            ["project", "Project"],
            ["course", "Course"],
            ["certification", "Certification"],
          ] as const).map(([kind, label]) => (
            <Button
              key={kind}
              variant="outline"
              size="sm"
              onClick={() => addItem(kind)}
            >
              <Plus className="h-3.5 w-3.5" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex justify-between gap-3">
        <Button variant="ghost" onClick={onCancel}>
          Cancel import
        </Button>
        <Button onClick={onContinue}>Review my profile</Button>
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  items,
  draft,
  onChange,
}: {
  title: string;
  items: ResumeDraftItem[];
  draft: ResumeImportDraft;
  onChange: (draft: ResumeImportDraft) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h3>
      {items.map((item) => (
        <article key={item.id} className="space-y-3 rounded-2xl border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Input
                value={item.title}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    items: draft.items.map((current) =>
                      current.id === item.id
                        ? { ...current, title: event.target.value }
                        : current,
                    ),
                  })
                }
              />
              {isCourseKind(item.kind) ? null : (
                <Input
                  value={item.organization ?? ""}
                  placeholder="Organization"
                  onChange={(event) =>
                    onChange({
                      ...draft,
                      items: draft.items.map((current) =>
                        current.id === item.id
                          ? { ...current, organization: event.target.value }
                          : current,
                      ),
                    })
                  }
                />
              )}
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  value={item.startDate ?? ""}
                  placeholder="Start YYYY or YYYY-MM"
                  onChange={(event) => {
                    const value = event.target.value;

                    if (!isDateDraftInput(value)) {
                      return;
                    }

                    onChange({
                      ...draft,
                      items: draft.items.map((current) =>
                        current.id === item.id
                          ? {
                              ...current,
                              startDate: value || undefined,
                            }
                          : current,
                      ),
                    });
                  }}
                />
                <Input
                  value={item.endDate ?? ""}
                  placeholder="End YYYY or YYYY-MM"
                  onChange={(event) => {
                    const value = event.target.value;

                    if (!isDateDraftInput(value)) {
                      return;
                    }

                    onChange({
                      ...draft,
                      items: draft.items.map((current) =>
                        current.id === item.id
                          ? {
                              ...current,
                              endDate: value || undefined,
                            }
                          : current,
                      ),
                    });
                  }}
                />
              </div>
              {item.startDate &&
              !PROFILE_ITEM_DATE_PATTERN.test(item.startDate) ? (
                <p className="text-xs text-destructive">
                  Use YYYY or YYYY-MM, with months 01–12.
                </p>
              ) : null}
              {item.endDate &&
              !PROFILE_ITEM_DATE_PATTERN.test(item.endDate) ? (
                <p className="text-xs text-destructive">
                  Use YYYY or YYYY-MM, with months 01–12.
                </p>
              ) : null}
              <Textarea
                value={item.description ?? ""}
                rows={3}
                maxLength={PROFILE_ITEM_DESCRIPTION_MAX}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    items: draft.items.map((current) =>
                      current.id === item.id
                        ? { ...current, description: event.target.value }
                        : current,
                    ),
                  })
                }
              />
              <select
                value={item.status}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                onChange={(event) =>
                  onChange({
                    ...draft,
                    items: draft.items.map((current) =>
                      current.id === item.id
                        ? {
                            ...current,
                            status: event.target.value as ResumeDraftItem["status"],
                          }
                        : current,
                    ),
                  })
                }
              >
                <option value="completed">Completed</option>
                <option value="in-progress">In progress</option>
              </select>
            </div>
            <button
              type="button"
              aria-label={`Delete ${item.title}`}
              className="rounded-md p-1.5 text-muted-foreground hover:text-destructive"
              onClick={() =>
                onChange({
                  ...draft,
                  items: draft.items.filter((current) => current.id !== item.id),
                })
              }
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          {item.sourceIds.length > 1 ? (
            <p className="text-xs text-muted-foreground">
              Found in {item.sourceIds.length} resumes
            </p>
          ) : null}
          <ResumeDraftEvidenceEditor
            item={item}
            onChange={(nextItem) =>
              onChange({
                ...draft,
                items: draft.items.map((current) =>
                  current.id === item.id ? nextItem : current,
                ),
              })
            }
          />
        </article>
      ))}
    </section>
  );
}

function StandaloneSection({
  draft,
  onChange,
}: {
  draft: ResumeImportDraft;
  onChange: (draft: ResumeImportDraft) => void;
}) {
  const [skillName, setSkillName] = useState("");
  const selectedIds = new Set(draft.selectedStandaloneSkillIds);
  const directSkills = draft.standaloneSkills.filter(isDirectDraftSkill);

  const addSkill = () => {
    const created = createManualDraftSkill(skillName);

    if (!created) {
      return;
    }

    const alreadyListed = draft.standaloneSkills.some(
      (skill) => skill.id === created.id,
    );

    onChange({
      ...draft,
      standaloneSkills: alreadyListed
        ? draft.standaloneSkills
        : [...draft.standaloneSkills, created],
      selectedStandaloneSkillIds: Array.from(
        new Set([...draft.selectedStandaloneSkillIds, created.id]),
      ),
    });
    setSkillName("");
  };

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Also listed on your resume
      </h3>
      <p className="text-sm text-muted-foreground">
        These were listed as skills, but Mova couldn&apos;t connect them to a
        specific experience. Selected skills are added as developing
        self-reported roots.
      </p>
      <div className="space-y-2">
        {directSkills.map((skill) => (
          <div
            key={skill.id}
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
          >
            <input
              type="checkbox"
              checked={selectedIds.has(skill.id)}
              aria-label={`Keep ${skill.name} as developing`}
              onChange={(event) =>
                onChange({
                  ...draft,
                  selectedStandaloneSkillIds: event.target.checked
                    ? Array.from(
                        new Set([
                          ...draft.selectedStandaloneSkillIds,
                          skill.id,
                        ]),
                      )
                    : draft.selectedStandaloneSkillIds.filter(
                        (id) => id !== skill.id,
                      ),
                })
              }
            />
            <span className="min-w-0 flex-1 font-medium">{skill.name}</span>
            <span className="text-xs text-muted-foreground">Developing</span>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-destructive"
              onClick={() =>
                onChange({
                  ...draft,
                  standaloneSkills: draft.standaloneSkills.filter(
                    (current) => current.id !== skill.id,
                  ),
                  selectedStandaloneSkillIds:
                    draft.selectedStandaloneSkillIds.filter(
                      (id) => id !== skill.id,
                    ),
                })
              }
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={skillName}
          placeholder="Add a listed skill"
          onChange={(event) => setSkillName(event.target.value)}
        />
        <Button variant="outline" onClick={addSkill}>
          Add skill
        </Button>
      </div>
    </section>
  );
}
