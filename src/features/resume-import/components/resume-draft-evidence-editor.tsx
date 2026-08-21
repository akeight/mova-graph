"use client";

import { useState } from "react";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { expandEvidenceImplications } from
  "@/features/goals/services/normalize-evidence";
import type { ExtractedSkill } from
  "@/features/skill-analysis/types/profile-item-extraction";

import {
  addManualSkillToDraftItem,
  isDirectDraftSkill,
  isManualDraftSkill,
} from "../services/resume-draft-skills";
import type { ResumeDraftItem } from "../types/resume-import";

function evidenceConfidenceLabel(skill: ExtractedSkill) {
  if (isManualDraftSkill(skill)) {
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

type ResumeDraftEvidenceEditorProps = {
  item: ResumeDraftItem;
  onChange: (item: ResumeDraftItem) => void;
};

export function ResumeDraftEvidenceEditor({
  item,
  onChange,
}: ResumeDraftEvidenceEditorProps) {
  const [skillName, setSkillName] = useState("");
  const directSkills = item.skills.filter(isDirectDraftSkill);

  const updateItem = (next: ResumeDraftItem) => {
    const directIds = new Set(
      next.skills.filter(isDirectDraftSkill).map((skill) => skill.id),
    );

    onChange({
      ...next,
      selectedSkillIds: next.selectedSkillIds.filter((id) =>
        directIds.has(id),
      ),
    });
  };

  const toggleSkill = (skillId: string, selected: boolean) => {
    const skill = item.skills.find((entry) => entry.id === skillId);

    if (!skill || !isDirectDraftSkill(skill)) {
      return;
    }

    updateItem({
      ...item,
      selectedSkillIds: selected
        ? Array.from(new Set([...item.selectedSkillIds, skillId]))
        : item.selectedSkillIds.filter((id) => id !== skillId),
    });
  };

  const removeSkill = (skillId: string) => {
    updateItem({
      ...item,
      skills: item.skills.filter(
        (skill) =>
          skill.id !== skillId && skill.derivedFromSkillId !== skillId,
      ),
      selectedSkillIds: item.selectedSkillIds.filter((id) => id !== skillId),
    });
  };

  const addSkill = () => {
    const nextItem = addManualSkillToDraftItem(item, skillName);

    if (nextItem === item && !skillName.trim()) {
      return;
    }

    updateItem(nextItem);
    setSkillName("");
  };

  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-medium">Evidence</legend>

      {directSkills.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No skills or evidence were linked yet.
          <br />
          Add anything Mova missed below.
        </p>
      ) : null}

      {directSkills.map((skill) => {
        const impliedSkills = expandEvidenceImplications(skill.id);
        const confidenceLabel = evidenceConfidenceLabel(skill);
        const selected = item.selectedSkillIds.includes(skill.id);

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
                toggleSkill(skill.id, event.target.checked)
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
                  Not yet mapped to a MOVa career evidence category
                </p>
              ) : skill.sourcePhrase ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Mapped from: &quot;{skill.sourcePhrase}&quot;
                </p>
              ) : null}
              {skill.evidence ? (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Why MOVa added this: {skill.evidence}
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
              onClick={() => removeSkill(skill.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}

      <div className="flex gap-2">
        <Input
          value={skillName}
          placeholder="Add a skill or evidence"
          onChange={(event) => setSkillName(event.target.value)}
        />
        <Button type="button" variant="outline" size="sm" onClick={addSkill}>
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
    </fieldset>
  );
}
