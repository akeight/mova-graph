import {
    ArrowUpRight,
    CheckCircle2,
    FlaskConical,
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
    activeRecommendationId: string | null;
    onSimulate: (
      recommendation: NextMoveRecommendation,
    ) => void;
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
      "border-destructive/30 bg-destructive/10 text-destructive",
  },
  high: {
    label: "High priority",
    className:
      "border-warning/30 bg-warning/10 text-warning",
  },
  medium: {
    label: "Medium priority",
    className:
      "border-info/30 bg-info/10 text-info",
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
    activeRecommendationId,
    onSimulate,
  }: RecommendationSummaryProps) {
    if (recommendations.length === 0) {
      return (
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/12 text-success">
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
                Your modeled competencies are covered
              </h2>
  
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Mova did not identify any missing or developing
                core or common competencies for {roleTitle}.
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
  
    const isBestRecommendationActive =
      activeRecommendationId === bestRecommendation.id;
  
    return (
      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-category-recommendation/12 text-category-recommendation">
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
  
        <article
          className={cn(
            "mt-5 rounded-2xl border border-category-recommendation/30 bg-category-recommendation/8 p-5",
            isBestRecommendationActive &&
              "ring-2 ring-primary/50 ring-offset-2 ring-offset-background",
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-category-recommendation">
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
  
            <span className="inline-flex items-center gap-1.5 rounded-full border border-category-recommendation/30 bg-background px-3 py-1 text-xs font-semibold text-category-recommendation">
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
  
          <div className="mt-4 rounded-xl border border-category-recommendation/25 bg-background/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Why this matters
            </p>
  
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {bestRecommendation.reason}
            </p>
          </div>
  
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border bg-background px-2.5 py-1 capitalize">
              {bestRecommendation.tier} competency
            </span>
  
            <span className="rounded-full border bg-background px-2.5 py-1 capitalize">
              Currently {bestRecommendation.currentStatus}
            </span>
          </div>
  
          <button
            type="button"
            onClick={() =>
              onSimulate(bestRecommendation)
            }
            aria-pressed={isBestRecommendationActive}
            className={cn(
              "mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2",
              "text-sm font-semibold transition-colors",
              isBestRecommendationActive
                ? "bg-highlight text-white hover:bg-highlight/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            <FlaskConical
              className="h-4 w-4"
              aria-hidden="true"
            />
  
            {isBestRecommendationActive
              ? "Previewing impact"
              : "Preview impact"}
          </button>
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
  
                const isActive =
                  activeRecommendationId ===
                  recommendation.id;
  
                return (
                  <article
                    key={recommendation.id}
                    className={cn(
                      "rounded-xl border bg-background p-4",
                      isActive &&
                        "border-primary/40 ring-2 ring-primary/25",
                    )}
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
                            {recommendation.competencyName}
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
  
                      <span className="text-xs font-semibold text-success">
                        +
                        {
                          recommendation.estimatedScoreIncrease
                        }{" "}
                        points
                      </span>
                    </div>
  
                    <button
                      type="button"
                      onClick={() =>
                        onSimulate(recommendation)
                      }
                      aria-pressed={isActive}
                      className={cn(
                        "mt-4 inline-flex w-full items-center justify-center gap-2",
                        "rounded-lg border px-3 py-2 text-sm font-medium",
                        "transition-colors",
                        isActive
                          ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
                          : "hover:bg-muted",
                      )}
                    >
                      <FlaskConical
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
  
                      {isActive
                        ? "Previewing impact"
                        : "Preview impact"}
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>
    );
  }