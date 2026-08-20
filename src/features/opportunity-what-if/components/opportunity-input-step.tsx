"use client";

import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import {
  MAX_OPPORTUNITY_TEXT_CHARS,
  MIN_OPPORTUNITY_TEXT_CHARS,
} from "../constants";
import type { OpportunityType } from "../types/opportunity-what-if";

const opportunityTypeOptions: Array<{
  type: OpportunityType;
  label: string;
}> = [
  { type: "internship", label: "Internship" },
  { type: "course", label: "Course" },
  { type: "certification", label: "Certification" },
  { type: "project", label: "Project" },
  { type: "other", label: "Other" },
];

type OpportunityInputStepProps = {
  opportunityType: OpportunityType;
  sourceText: string;
  error: string | null;
  isAnalyzing: boolean;
  onTypeChange: (type: OpportunityType) => void;
  onTextChange: (text: string) => void;
  onAnalyze: () => void;
};

export function OpportunityInputStep({
  opportunityType,
  sourceText,
  error,
  isAnalyzing,
  onTypeChange,
  onTextChange,
  onAnalyze,
}: OpportunityInputStepProps) {
  const trimmedLength = sourceText.trim().length;
  const tooShort =
    trimmedLength > 0 && trimmedLength < MIN_OPPORTUNITY_TEXT_CHARS;
  const tooLong = sourceText.length > MAX_OPPORTUNITY_TEXT_CHARS;
  const canAnalyze =
    !isAnalyzing &&
    trimmedLength >= MIN_OPPORTUNITY_TEXT_CHARS &&
    sourceText.length <= MAX_OPPORTUNITY_TEXT_CHARS;

  return (
    <section className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold">What are you considering?</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Paste an internship, course, certification, project, or other
          opportunity. Mova will estimate how completing it could change
          your current career readiness.
        </p>
      </div>

      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-5"
        role="group"
        aria-label="Opportunity type"
      >
        {opportunityTypeOptions.map((option) => (
          <button
            key={option.type}
            type="button"
            aria-pressed={opportunityType === option.type}
            onClick={() => onTypeChange(option.type)}
            className={cn(
              "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
              opportunityType === option.type
                ? "border-primary/40 bg-primary/10 text-primary"
                : "hover:bg-muted",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label htmlFor="opportunity-description" className="text-sm font-medium">
          Paste the description
        </label>
        <Textarea
          id="opportunity-description"
          value={sourceText}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder="Software Engineering Intern. Build React and TypeScript interfaces, integrate REST APIs, write automated tests..."
          className="min-h-36"
          disabled={isAnalyzing}
        />
        <p className="text-xs text-muted-foreground">
          {sourceText.length} / {MAX_OPPORTUNITY_TEXT_CHARS} characters
        </p>
        {tooShort ? (
          <p className="text-sm text-destructive">
            Please paste at least {MIN_OPPORTUNITY_TEXT_CHARS} characters.
          </p>
        ) : null}
        {tooLong ? (
          <p className="text-sm text-destructive">
            Keep the description to {MAX_OPPORTUNITY_TEXT_CHARS.toLocaleString()}{" "}
            characters or fewer.
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="button" onClick={onAnalyze} disabled={!canAnalyze}>
        {isAnalyzing ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            Analyzing opportunity
          </>
        ) : (
          "Analyze opportunity"
        )}
      </Button>
    </section>
  );
}
