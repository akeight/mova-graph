"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { expandEvidenceImplications } from
  "@/features/goals/services/normalize-evidence";
import {
  isDirectExtractedSkill,
  isManualExtractedSkill,
} from "@/features/skill-analysis/services/extracted-skill-review";
import type { ExtractedSkill } from
  "@/features/skill-analysis/types/profile-item-extraction";

import {
  addManualDraftSkill,
  removeDraftSkill,
  toggleDraftSkill,
} from "../services/opportunity-draft";
import type { OpportunityEvidenceDraft } from
  "../types/opportunity-what-if";

function evidenceConfidenceLabel(skill: ExtractedSkill) {
  if (isManualExtractedSkill(skill)) {
    return "Added by you";
  }

  if (skill.normalizationMethod === "unmapped") {
    return null;
  }

  if (skill.confidence < 0.6) {
    return "Low-confidence evidence match";
  }

  return `${Math.round(skill.confidence * 100)}% evidence confidence`;
}

type OpportunityReviewStepProps = {
  draft: OpportunityEvidenceDraft;
  error: string | null;
  onChange: (draft: OpportunityEvidenceDraft) => void;
  onSimulate: () => void;
  onBack: () => void;
};

export function OpportunityReviewStep({
  draft,
  error,
  onChange,
  onSimulate,
  onBack,
}: OpportunityReviewStepProps) {
  const [skillName, setSkillName] = useState("");
  const directSkills = draft.skills.filter(isDirectExtractedSkill);
  const selectedCount = draft.selectedSkillIds.length;

  const addSkill = () => {
    const next = addManualDraftSkill(draft, skillName);

    if (next !== draft) {
      onChange(next);
    }

    setSkillName("");
  };

  return (
    <section className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold">Here&apos;s what Mova understood</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Review the evidence this {draft.opportunityType} could develop if
          you completed it. Derived implications are shown for context and
          are not independently selectable.
        </p>
        <p className="mt-2 text-sm font-medium">{draft.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{draft.description}</p>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Direct evidence candidates
        </legend>

        {directSkills.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Mova couldn&apos;t map this description to supported career
            evidence. You can add evidence manually or try another
            description.
          </p>
        ) : null}

        {directSkills.map((skill) => {
          const impliedSkills = expandEvidenceImplications(skill.id);
          const confidenceLabel = evidenceConfidenceLabel(skill);
          const selected = draft.selectedSkillIds.includes(skill.id);

          return (
            <div
              key={skill.id}
              className="flex items-start gap-2 rounded-xl border bg-background px-3 py-2"
            >
              <input
                type="checkbox"
                className="mt-1"
                checked={selected}
                aria-label={`Include ${skill.name}`}
                onChange={(event) =>
                  onChange(
                    toggleDraftSkill(draft, skill.id, event.target.checked),
                  )
                }
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{skill.name}</p>
                  {confidenceLabel ? (
                    <span className="text-[11px] text-muted-foreground">
                      {confidenceLabel}
                    </span>
                  ) : null}
                </div>
                {skill.normalizationMethod === "unmapped" ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Not yet mapped to a Mova career evidence category
                  </p>
                ) : skill.evidence ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Why Mova added this: {skill.evidence}
                  </p>
                ) : null}
                {impliedSkills.length > 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Also contributes to:{" "}
                    {impliedSkills.map((implied) => implied.name).join(", ")}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                aria-label={`Remove ${skill.name}`}
                className="rounded-md p-1 text-muted-foreground hover:text-destructive"
                onClick={() => onChange(removeDraftSkill(draft, skill.id))}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </fieldset>

      <div className="flex gap-2">
        <Input
          value={skillName}
          placeholder="Add missing evidence"
          onChange={(event) => setSkillName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addSkill();
            }
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={addSkill}>
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={onSimulate} disabled={selectedCount === 0}>
          See projected impact
        </Button>
        <Button type="button" variant="outline" onClick={onBack}>
          Start over
        </Button>
      </div>
    </section>
  );
}
