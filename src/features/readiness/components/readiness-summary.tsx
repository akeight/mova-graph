import {
    CircleAlert,
    CircleCheck,
    CircleDashed,
    Target,
  } from "lucide-react";
  
  import { cn } from "@/lib/utils";
  
  import type { CareerRole } from
    "@/features/goals/types/career-role";
  
  import type {
    ReadinessAssessment,
    ReadinessStatus,
  } from "../types/readiness";
  
  type ReadinessSummaryProps = {
    role: CareerRole;
    assessment: ReadinessAssessment;
  };
  
  const statusConfig: Record<
    ReadinessStatus,
    {
      label: string;
      icon: typeof CircleCheck;
      className: string;
    }
  > = {
    demonstrated: {
      label: "Demonstrated",
      icon: CircleCheck,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
    },
    developing: {
      label: "Developing",
      icon: CircleDashed,
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
    },
    missing: {
      label: "Missing",
      icon: CircleAlert,
      className:
        "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
    },
  };
  
  export function ReadinessSummary({
    role,
    assessment,
  }: ReadinessSummaryProps) {
    return (
      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
              <Target
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>
  
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Role readiness
              </p>
  
              <h2 className="mt-1 text-xl font-semibold">
                {role.title}
              </h2>
  
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                See which role requirements you can
                demonstrate and where gaps remain.
              </p>
            </div>
          </div>
  
          <div className="text-right">
            <p className="text-4xl font-bold tracking-tight">
              {assessment.score}%
            </p>
  
            <p className="mt-1 text-xs text-muted-foreground">
              readiness coverage
            </p>
          </div>
        </div>
  
        <div className="mt-5">
          <div
            className="h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label={`${role.title} readiness`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={assessment.score}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{
                width: `${assessment.score}%`,
              }}
            />
          </div>
        </div>
  
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Metric
            label="Demonstrated"
            value={assessment.demonstratedCount}
            className="text-emerald-600 dark:text-emerald-400"
          />
  
          <Metric
            label="Developing"
            value={assessment.developingCount}
            className="text-amber-600 dark:text-amber-400"
          />
  
          <Metric
            label="Missing"
            value={assessment.missingCount}
            className="text-rose-600 dark:text-rose-400"
          />
        </div>
  
        <div className="mt-5 border-t pt-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold">
              Skill requirements
            </h3>
  
            <p className="text-xs text-muted-foreground">
              Required skills carry more weight
            </p>
          </div>
  
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {assessment.requirements.map(
              (requirement) => {
                const status =
                  statusConfig[requirement.status];
  
                const StatusIcon = status.icon;
  
                return (
                  <article
                    key={requirement.skillId}
                    className="flex items-center justify-between gap-3 rounded-xl border bg-background p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {requirement.skillName}
                      </p>
  
                      <p className="mt-1 text-xs capitalize text-muted-foreground">
                        {requirement.importance}
                      </p>
                    </div>
  
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                        status.className,
                      )}
                    >
                      <StatusIcon
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
  
                      {status.label}
                    </span>
                  </article>
                );
              },
            )}
          </div>
        </div>
  
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Readiness represents coverage of the selected
          role&apos;s modeled skill requirements. Developing
          skills receive partial credit, while required skills
          count twice as much as preferred skills.
        </p>
      </section>
    );
  }
  
  type MetricProps = {
    label: string;
    value: number;
    className: string;
  };
  
  function Metric({
    label,
    value,
    className,
  }: MetricProps) {
    return (
      <div className="rounded-xl border bg-background p-3 text-center">
        <p
          className={cn(
            "text-2xl font-bold",
            className,
          )}
        >
          {value}
        </p>
  
        <p className="mt-1 text-xs text-muted-foreground">
          {label}
        </p>
      </div>
    );
  }