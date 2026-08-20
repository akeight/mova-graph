"use client";

import { useMemo, useState } from "react";

import type { CareerRole } from "@/features/goals/types/career-role";
import { approvedSkillIdsFromSelection } from
  "@/features/skill-analysis/services/extracted-skill-review";
import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";

import {
  MAX_OPPORTUNITY_TEXT_CHARS,
  MIN_OPPORTUNITY_TEXT_CHARS,
} from "../constants";
import { buildOpportunityResult } from "../services/build-opportunity-result";
import { extractOpportunitySource } from
  "../services/extract-opportunity-client";
import { createOpportunityDraft } from "../services/opportunity-draft";
import type {
  OpportunityEvidenceDraft,
  OpportunityType,
  OpportunityWhatIfStage,
} from "../types/opportunity-what-if";

import { OpportunityImpactStep } from "./opportunity-impact-step";
import { OpportunityInputStep } from "./opportunity-input-step";
import { OpportunityReviewStep } from "./opportunity-review-step";

type OpportunityWhatIfFlowProps = {
  profile: StudentProfile;
  role: CareerRole;
  onAnalyzeStart?: () => void;
};

const initialType: OpportunityType = "internship";

export function OpportunityWhatIfFlow({
  profile,
  role,
  onAnalyzeStart,
}: OpportunityWhatIfFlowProps) {
  const [stage, setStage] = useState<OpportunityWhatIfStage>("input");
  const [opportunityType, setOpportunityType] =
    useState<OpportunityType>(initialType);
  const [sourceText, setSourceText] = useState("");
  const [draft, setDraft] = useState<OpportunityEvidenceDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(() => {
    if (stage !== "impact" || !draft) {
      return null;
    }

    const skillIds = approvedSkillIdsFromSelection(
      draft.skills,
      draft.selectedSkillIds,
    );

    if (skillIds.length === 0) {
      return null;
    }

    return buildOpportunityResult({
      opportunityType: draft.opportunityType,
      title: draft.title,
      description: draft.description,
      profile,
      role,
      skillIds,
    });
  }, [draft, profile, role, stage]);

  const resetLocalState = () => {
    setStage("input");
    setOpportunityType(initialType);
    setSourceText("");
    setDraft(null);
    setError(null);
  };

  const analyze = async () => {
    const text = sourceText.trim();

    if (text.length < MIN_OPPORTUNITY_TEXT_CHARS) {
      setError(`Please paste at least ${MIN_OPPORTUNITY_TEXT_CHARS} characters.`);
      return;
    }

    if (sourceText.length > MAX_OPPORTUNITY_TEXT_CHARS) {
      setError(
        `Keep the description to ${MAX_OPPORTUNITY_TEXT_CHARS.toLocaleString()} characters or fewer.`,
      );
      return;
    }

    onAnalyzeStart?.();
    setError(null);
    setStage("analyzing");

    try {
      const extraction = await extractOpportunitySource({
        opportunityType,
        text,
      });

      setDraft(createOpportunityDraft(extraction));
      setStage("review");
    } catch (caught) {
      setStage("input");
      setError(
        caught instanceof Error
          ? caught.message
          : "Mova could not analyze that opportunity. Please try again.",
      );
    }
  };

  const simulate = () => {
    if (!draft) {
      return;
    }

    const skillIds = approvedSkillIdsFromSelection(
      draft.skills,
      draft.selectedSkillIds,
    );

    if (skillIds.length === 0) {
      setError("Select at least one evidence item to simulate.");
      return;
    }

    setError(null);
    setStage("impact");
  };

  if (stage === "review" && draft) {
    return (
      <OpportunityReviewStep
        draft={draft}
        error={error}
        onChange={setDraft}
        onSimulate={simulate}
        onBack={resetLocalState}
      />
    );
  }

  if (stage === "impact" && result) {
    return (
      <OpportunityImpactStep
        roleTitle={role.title}
        result={result}
        onTryAnother={resetLocalState}
      />
    );
  }

  return (
    <OpportunityInputStep
      opportunityType={opportunityType}
      sourceText={sourceText}
      error={error}
      isAnalyzing={stage === "analyzing"}
      onTypeChange={setOpportunityType}
      onTextChange={setSourceText}
      onAnalyze={() => {
        void analyze();
      }}
    />
  );
}
