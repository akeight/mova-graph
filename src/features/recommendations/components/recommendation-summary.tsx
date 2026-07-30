import {
    ArrowUpRight,
    CheckCircle2,
    Lightbulb,
    TrendingUp,
  } from "lucide-react";
  
  import { cn } from "@/lib/utils";
  
  import type {
    NextMoveRecommendation,
    RecommendationPriorityLevel,
  } from "../types/recommendation";
  
  type RecommendationSummaryProps = {
    roleTitle: string;
    recommendations: NextMoveRecommendation[];
  };
  
  const priorityConfig: Record<
    RecommendationPriorityLevel,
    {
      label: string;
      className: string;
    }
  > = {
    critical: {
      label: "Critical",
      className:
        "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
    },
    high: {
      label: "High priority",
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
    },
    medium: {
      label: "Medium priority",
      className:
        "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
    },
    low: {
      label: "Lower priority",
      className:
        "border-muted bg-muted text-muted-foreground",
    },
  };
  
  export function RecommendationSummary({
    roleTitle,
    recommendations,
  }: RecommendationSummaryProps) {
    if (recommendations.length === 0) {
      return (
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>
  
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Next moves
              </p>
  
              <h2 className="mt-1 text-xl font-semibold">
                Your modeled requirements are covered
              </h2>
  
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Mova did not identify any missing or developing
                skills for {roleTitle}.
              </p>
            </div>
          </div>
        </section>
      );
    }
  
    const [bestRecommendation, ...otherRecommendations] =
      recommendations;
  
    const bestPriority =
      priorityConfig[bestRecommendation.priorityLevel];
  
    return (
      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
            <Lightbulb
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>
  
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Recommended next moves
            </p>
  
            <h2 className="mt-1 text-xl font-semibold">
              Focus on what creates the most progress
            </h2>
  
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              These actions are ranked using your current
              readiness gaps for {roleTitle}.
            </p>
          </div>
        </div>
  
        <article className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5 dark:border-cyan-900 dark:bg-cyan-950/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-800 dark:text-cyan-200">
                Best next move
              </span>
  
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium",
                  bestPriority.className,
                )}
              >
                {bestPriority.label}
              </span>
            </div>
  
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-background px-3 py-1 text-xs font-semibold text-cyan-800 dark:border-cyan-900 dark:text-cyan-200">
              <TrendingUp
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
              +{bestRecommendation.estimatedScoreIncrease} points
            </span>
          </div>
  
          <h3 className="mt-4 text-lg font-semibold">
            {bestRecommendation.title}
          </h3>
  
          <p className="mt-2 text-sm leading-relaxed">
            {bestRecommendation.action}
          </p>
  
          <div className="mt-4 rounded-xl border border-cyan-200/80 bg-background/80 p-3 dark:border-cyan-900">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Why this matters
            </p>
  
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {bestRecommendation.reason}
            </p>
          </div>
  
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border bg-background px-2.5 py-1 capitalize">
              {bestRecommendation.importance} skill
            </span>
  
            <span className="rounded-full border bg-background px-2.5 py-1 capitalize">
              Currently {bestRecommendation.currentStatus}
            </span>
          </div>
        </article>
  
        {otherRecommendations.length > 0 ? (
          <div className="mt-5">
            <h3 className="text-sm font-semibold">
              Other high-impact moves
            </h3>
  
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {otherRecommendations.map((recommendation) => {
                const priority =
                  priorityConfig[
                    recommendation.priorityLevel
                  ];
  
                return (
                  <article
                    key={recommendation.id}
                    className="rounded-xl border bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                          {recommendation.priority}
                        </div>
  
                        <div className="min-w-0">
                          <h4 className="font-semibold leading-snug">
                            {recommendation.title}
                          </h4>
  
                          <p className="mt-1 text-xs text-muted-foreground">
                            {recommendation.skillName}
                          </p>
                        </div>
                      </div>
  
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
  
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {recommendation.action}
                    </p>
  
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs font-medium",
                          priority.className,
                        )}
                      >
                        {priority.label}
                      </span>
  
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        +
                        {
                          recommendation.estimatedScoreIncrease
                        }{" "}
                        points
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>
    );
  }