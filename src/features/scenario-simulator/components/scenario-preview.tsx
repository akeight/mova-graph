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
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
    },
    developing: {
      label: "Developing",
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
    },
    missing: {
      label: "Missing",
      className:
        "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
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
        className="rounded-2xl border border-violet-300 bg-violet-50/50 p-5 shadow-sm dark:border-violet-900 dark:bg-violet-950/30"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200">
              <TrendingUp
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>
  
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700 dark:text-violet-300">
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
  
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center dark:border-emerald-900 dark:bg-emerald-950">
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              +{scenario.scoreIncrease}
            </p>
  
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
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
  
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-violet-200 bg-background/80 p-3 text-sm text-muted-foreground dark:border-violet-900">
          <ShieldCheck
            className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-300"
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
            "border-violet-300 ring-2 ring-violet-200/50 dark:border-violet-800 dark:ring-violet-900/50",
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