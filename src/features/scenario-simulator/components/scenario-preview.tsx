import {
    ArrowRight,
    Eye,
    RotateCcw,
    ShieldCheck,
    TrendingUp,
  } from "lucide-react";
  
  import { cn } from "@/lib/utils";
  
  import type { ReadinessStatus } from
    "@/features/readiness/types/readiness";
  
  import type { RecommendationScenarioResult } from
    "../types/scenario";
  
  type ScenarioPreviewProps = {
    roleTitle: string;
    scenario: RecommendationScenarioResult | null;
    onClear: () => void;
  };
  
  const statusConfig: Record<
    ReadinessStatus,
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
    missing: {
      label: "Missing",
      className:
        "border-destructive/30 bg-destructive/12 text-destructive",
    },
  };
  
  export function ScenarioPreview({
    roleTitle,
    scenario,
    onClear,
  }: ScenarioPreviewProps) {
    if (!scenario) {
      return (
        <section className="rounded-2xl border border-dashed bg-card p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <Eye
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>
  
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Scenario simulator
              </p>
  
              <h2 className="mt-1 text-xl font-semibold">
                Preview a possible next move
              </h2>
  
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Choose Preview impact on a recommendation to see
                how completing it could change your readiness for{" "}
                {roleTitle}.
              </p>
            </div>
          </div>
        </section>
      );
    }
  
    const beforeStatus =
      statusConfig[scenario.statusChange.before];
  
    const afterStatus =
      statusConfig[scenario.statusChange.after];
  
    return (
      <section
        className="rounded-2xl border border-highlight/30 bg-highlight/8 p-5 shadow-sm"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-highlight/15 text-highlight">
              <TrendingUp
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>
  
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-highlight">
                Hypothetical preview
              </p>
  
              <h2 className="mt-1 text-xl font-semibold">
                {scenario.recommendation.title}
              </h2>
  
              <p className="mt-1 text-sm text-muted-foreground">
                See how this move could affect your readiness for{" "}
                {roleTitle}.
              </p>
            </div>
          </div>
  
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <RotateCcw
              className="h-4 w-4"
              aria-hidden="true"
            />
            Exit preview
          </button>
        </div>
  
        <div className="mt-5 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto]">
          <ScoreCard
            label="Current readiness"
            score={scenario.scoreBefore}
          />
  
          <ArrowRight
            className="mx-auto hidden h-5 w-5 text-muted-foreground md:block"
            aria-hidden="true"
          />
  
          <ScoreCard
            label="Projected readiness"
            score={scenario.scoreAfter}
            emphasized
          />
  
          <div className="rounded-xl border border-success/30 bg-success/12 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-success">
              +{scenario.scoreIncrease}
            </p>

            <p className="mt-1 text-xs text-success">
              readiness points
            </p>
          </div>
        </div>
  
        <div className="mt-5 rounded-xl border bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Skill impact
          </p>
  
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="font-semibold">
              {scenario.statusChange.skillName}
            </p>
  
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium",
                beforeStatus.className,
              )}
            >
              {beforeStatus.label}
            </span>
  
            <ArrowRight
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
  
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium",
                afterStatus.className,
              )}
            >
              {afterStatus.label}
            </span>
          </div>
        </div>
  
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-highlight/25 bg-background/80 p-3 text-sm text-muted-foreground">
          <ShieldCheck
            className="mt-0.5 h-4 w-4 shrink-0 text-highlight"
            aria-hidden="true"
          />
  
          <p>
            This is only a preview. Your real student profile has
            not been changed or saved.
          </p>
        </div>
      </section>
    );
  }
  
  type ScoreCardProps = {
    label: string;
    score: number;
    emphasized?: boolean;
  };
  
  function ScoreCard({
    label,
    score,
    emphasized = false,
  }: ScoreCardProps) {
    return (
      <div
        className={cn(
        "rounded-xl border bg-background p-4 text-center",
        emphasized &&
          "border-primary/40 ring-2 ring-primary/25",
      )}
      >
        <p className="text-3xl font-bold tracking-tight">
          {score}%
        </p>
  
        <p className="mt-1 text-xs text-muted-foreground">
          {label}
        </p>
      </div>
    );
  }