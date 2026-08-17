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
import { PROFILE_ITEM_DESCRIPTION_MAX } from
  "@/features/student-profile/constants";
import { addSelfReportedSkills } from
  "@/features/student-profile/services/profile-self-reported-skill-service";
import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";

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

import type {
  ResumeDraftItem,
  ResumeImportDraft,
  ResumeImportMode,
  ResumeItemKind,
} from "../types/resume-import";

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

  const canAnalyze = sources.length > 0;

  const addParsedSource = (displayName: string, text: string) => {
    setSources((current) => {
      if (current.length >= MAX_RESUME_SOURCES) {
        return current;
      }

      return [
        ...current,
        {
          id: createSourceId(),
          displayName,
          text: text.slice(0, MAX_RESUME_TEXT_CHARS),
        },
      ];
    });
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
  error,
  onChange,
  onContinue,
  onCancel,
}: {
  draft: ResumeImportDraft;
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
    draft.items.find((item) => item.id === current.rightId) ??
    null;

  const decide = (decision: "merge" | "keep-separate") => {
    const next = applyDuplicateDecision(draft, current.id, decision);
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
        <DuplicateCard item={right} />
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

function DuplicateCard({ item }: { item: ResumeDraftItem | undefined | null }) {
  if (!item) {
    return (
      <div className="rounded-xl border p-4 text-sm text-muted-foreground">
        Existing profile item
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="font-medium">{item.title}</p>
      {item.organization ? (
        <p className="text-xs text-muted-foreground">{item.organization}</p>
      ) : null}
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
          <div className="flex flex-wrap gap-1.5">
            {item.skills
              .filter((skill) => skill.provenance !== "derived")
              .map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-full border px-2 py-0.5 text-[11px]"
                >
                  {skill.name}
                </span>
              ))}
          </div>
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

  if (draft.standaloneSkills.length === 0 && !skillName) {
    return (
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Standalone skills
        </h3>
        <div className="flex gap-2">
          <Input
            value={skillName}
            placeholder="Add a listed skill"
            onChange={(event) => setSkillName(event.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => {
              if (!skillName.trim()) {
                return;
              }

              const next = addSelfReportedSkills(
                {
                  id: "draft",
                  name: "Draft",
                  courses: [],
                  experiences: [],
                  skills: [],
                },
                [skillName],
              ).skills.filter((skill) => skill.selfReported);

              onChange({
                ...draft,
                standaloneSkills: [
                  ...draft.standaloneSkills,
                  ...next.map((skill) => ({
                    id: skill.id,
                    name: skill.name,
                    confidence: 0,
                    evidence: "Added during review",
                    provenance: "direct" as const,
                  })),
                ],
              });
              setSkillName("");
            }}
          >
            Add skill
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Also listed on your resume
      </h3>
      <p className="text-sm text-muted-foreground">
        These were listed as skills, but MOVa couldn&apos;t connect them to a
        specific experience.
      </p>
      <div className="flex flex-wrap gap-2">
        {draft.standaloneSkills.map((skill) => (
          <button
            key={skill.id}
            type="button"
            className="rounded-full border px-3 py-1 text-xs hover:border-destructive hover:text-destructive"
            onClick={() =>
              onChange({
                ...draft,
                standaloneSkills: draft.standaloneSkills.filter(
                  (current) => current.id !== skill.id,
                ),
              })
            }
          >
            {skill.name} · Keep as developing
          </button>
        ))}
      </div>
    </section>
  );
}
