import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleDot,
  Target,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type { CareerRole } from
  "@/features/goals/types/career-role";

import type {
  CompetencyReadiness,
  DisplayStatus,
  ReadinessAssessment,
} from "../types/readiness";

type ReadinessSummaryProps = {
  role: CareerRole;
  assessment: ReadinessAssessment;
};

const statusConfig: Record<
  DisplayStatus,
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
      "border-success/30 bg-success/12 text-success",
  },
  developing: {
    label: "Developing",
    icon: CircleDashed,
    className:
      "border-warning/30 bg-warning/12 text-warning",
  },
  missing: {
    label: "Missing",
    icon: CircleAlert,
    className:
      "border-destructive/30 bg-destructive/12 text-destructive",
  },
  "not-explored": {
    label: "Not explored",
    icon: CircleDot,
    className:
      "border-muted bg-muted text-muted-foreground",
  },
};

const TIER_COPY = {
  core: {
    title: "Core",
    hint: "Foundational for this career type",
  },
  common: {
    title: "Common",
    hint: "Frequently valuable across roles",
  },
  specialized: {
    title: "Specialized",
    hint: "Varies by company, stack, or focus",
  },
} as const;

export function ReadinessSummary({
  role,
  assessment,
}: ReadinessSummaryProps) {
  const core = assessment.competencies.filter(
    (competency) => competency.tier === "core",
  );
  const common = assessment.competencies.filter(
    (competency) => competency.tier === "common",
  );
  const specialized = assessment.competencies.filter(
    (competency) => competency.tier === "specialized",
  );

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-category-role/12 text-category-role">
            <Target
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Career readiness
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              {role.title}
            </h2>

            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              See which core and common competencies you can
              demonstrate and where gaps remain. Specialized
              tracks are optional focus areas.
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
          className="text-success"
        />

        <Metric
          label="Developing"
          value={assessment.developingCount}
          className="text-warning"
        />

        <Metric
          label="Missing"
          value={assessment.missingCount}
          className="text-destructive"
        />
      </div>

      <CompetencySection
        title={TIER_COPY.core.title}
        hint={TIER_COPY.core.hint}
        competencies={core}
      />

      <CompetencySection
        title={TIER_COPY.common.title}
        hint={TIER_COPY.common.hint}
        competencies={common}
      />

      <CompetencySection
        title={TIER_COPY.specialized.title}
        hint={TIER_COPY.specialized.hint}
        competencies={specialized}
      />

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Readiness is weighted coverage of core and common
        competencies from evidence in your MOVa profile (60%
        average core coverage, 40% average common coverage).
        It is not a prediction of getting hired, a claim that
        every employer requires the same stack, or opportunity
        fit such as years of experience, location, or clearance.
        Developing evidence receives partial credit. Specialized
        competencies are shown but do not change this score.
      </p>
    </section>
  );
}

function CompetencySection({
  title,
  hint,
  competencies,
}: {
  title: string;
  hint: string;
  competencies: CompetencyReadiness[];
}) {
  return (
    <div className="mt-5 border-t pt-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold">
          {title}
        </h3>

        <p className="text-xs text-muted-foreground">
          {hint}
        </p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {competencies.map((competency) => {
          const status = statusConfig[competency.displayStatus];
          const StatusIcon = status.icon;

          return (
            <article
              key={competency.competencyId}
              className="flex items-center justify-between gap-3 rounded-xl border bg-background p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {competency.competencyName}
                </p>

                <p className="mt-1 text-xs capitalize text-muted-foreground">
                  {competency.tier}
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
        })}
      </div>
    </div>
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
