"use client";

import { ArrowRight, RotateCcw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { formatOpportunityImpactCopy } from
  "../services/build-opportunity-result";
import type { OpportunitySimulationResult } from
  "../types/opportunity-what-if";

function percent(credit: number): number {
  return Math.round(credit * 100);
}

type OpportunityImpactStepProps = {
  roleTitle: string;
  result: OpportunitySimulationResult;
  onTryAnother: () => void;
};

export function OpportunityImpactStep({
  roleTitle,
  result,
  onTryAnother,
}: OpportunityImpactStepProps) {
  const deltaLabel =
    result.scoreIncrease > 0 ? `+${result.scoreIncrease}` : "0";
  const explanation = formatOpportunityImpactCopy({
    opportunityType: result.opportunityType,
    roleTitle,
    addedEvidenceNames: result.explanation.addedEvidenceNames,
    strengthenedCompetencyNames:
      result.explanation.strengthenedCompetencyNames,
    zeroDeltaReason: result.explanation.zeroDeltaReason,
  });

  return (
    <section
      className="space-y-5 rounded-2xl border border-highlight/30 bg-highlight/8 p-5 shadow-sm"
      aria-live="polite"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-highlight">
          If completed
        </p>
        <h2 className="mt-1 text-xl font-semibold">
          Projected impact for {roleTitle}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{result.title}</p>
      </div>

      <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto]">
        <ScoreCard label="Current readiness" score={result.scoreBefore} />
        <ArrowRight
          className="mx-auto hidden h-5 w-5 text-muted-foreground md:block"
          aria-hidden="true"
        />
        <ScoreCard
          label="If completed"
          score={result.scoreAfter}
          emphasized
        />
        <div className="rounded-xl border border-success/30 bg-success/12 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-success">{deltaLabel}</p>
          <p className="mt-1 text-xs text-success">projected impact</p>
        </div>
      </div>

      {result.strengthenedCompetencies.length > 0 ? (
        <div className="rounded-xl border bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            This would strengthen
          </p>
          <ul className="mt-3 space-y-2">
            {result.strengthenedCompetencies.map((impact) => (
              <li
                key={impact.competencyId}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <span className="font-medium">{impact.competencyName}</span>
                <span className="text-muted-foreground">
                  {percent(impact.creditBefore)}% → {percent(impact.creditAfter)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.remainingGaps.length > 0 ? (
        <div className="rounded-xl border bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            You&apos;d still want to develop
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {result.remainingGaps.map((gap) => (
              <li key={gap.competencyId}>{gap.competencyName}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-xl border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Why this helps
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {explanation}
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-highlight/25 bg-background/80 p-3 text-sm text-muted-foreground">
        <ShieldCheck
          className="mt-0.5 h-4 w-4 shrink-0 text-highlight"
          aria-hidden="true"
        />
        <p>
          This is only a preview of completing this opportunity. Your saved
          profile and actual readiness have not changed.
        </p>
      </div>

      <Button type="button" variant="outline" onClick={onTryAnother}>
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Try another opportunity
      </Button>
    </section>
  );
}

function ScoreCard({
  label,
  score,
  emphasized = false,
}: {
  label: string;
  score: number;
  emphasized?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-background p-4 text-center",
        emphasized && "border-primary/40 ring-2 ring-primary/25",
      )}
    >
      <p className="text-3xl font-bold tracking-tight">{score}%</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
