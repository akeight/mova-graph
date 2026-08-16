"use client";

import {
  ArrowRight,
  CircleAlert,
  CircleDashed,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type { CareerRole } from "@/features/goals/types/career-role";
import type { ReadinessAssessment } from "@/features/readiness/types/readiness";
import type { NextMoveRecommendation } from "@/features/recommendations/types/recommendation";
import type { StudentProfile } from "@/features/student-profile/types/student-profile";

import type { WorkspaceView } from "../../types/workspace-view";

type DashboardViewProps = {
  profile: StudentProfile;
  role: CareerRole;
  roles: CareerRole[];
  onRoleSelect: (roleId: string) => void;
  assessment: ReadinessAssessment;
  recommendations: NextMoveRecommendation[];
  onNavigate: (view: WorkspaceView) => void;
};

const gapStatusConfig = {
  developing: {
    label: "Developing",
    icon: CircleDashed,
    className:
      "text-amber-600 dark:text-amber-400",
  },
  missing: {
    label: "Missing",
    icon: CircleAlert,
    className:
      "text-rose-600 dark:text-rose-400",
  },
} as const;

export function DashboardView({
  profile,
  role,
  roles,
  onRoleSelect,
  assessment,
  recommendations,
  onNavigate,
}: DashboardViewProps) {
  const firstName = profile.name.split(" ")[0];

  const bestMove = recommendations[0] ?? null;
  const topGaps = recommendations.slice(0, 3);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Welcome back, {firstName}
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your path to {role.title}
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Based on your experiences, coursework, projects,
            and demonstrated skills.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Target career
          </span>

          <Select
            value={role.id}
            onValueChange={onRoleSelect}
          >
            <SelectTrigger
              size="default"
              aria-label="Change target career"
              className="h-9 rounded-xl bg-card px-3 font-medium text-foreground shadow-sm"
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent align="end">
              {roles.map((careerRole) => (
                <SelectItem
                  key={careerRole.id}
                  value={careerRole.id}
                >
                  {careerRole.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <section
        aria-label="Career readiness"
        className="overflow-hidden rounded-3xl border bg-card p-6 shadow-sm sm:p-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Career readiness
            </p>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-6xl font-bold tracking-tight text-foreground sm:text-7xl">
                {assessment.score}%
              </span>

              <span className="text-sm font-medium text-muted-foreground">
                readiness for {role.title}
              </span>
            </div>

            <div
              className="mt-5 h-2.5 w-full max-w-md overflow-hidden rounded-full bg-primary/15"
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

          <dl className="grid shrink-0 grid-cols-3 gap-3 lg:w-80">
            <ReadinessStat
              label="Demonstrated"
              value={assessment.demonstratedCount}
              className="text-emerald-600 dark:text-emerald-400"
            />

            <ReadinessStat
              label="Developing"
              value={assessment.developingCount}
              className="text-amber-600 dark:text-amber-400"
            />

            <ReadinessStat
              label="Missing"
              value={assessment.missingCount}
              className="text-rose-600 dark:text-rose-400"
            />
          </dl>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lightbulb
                className="h-5 w-5"
                aria-hidden="true"
              />
            </span>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Your next move
              </p>

              {bestMove ? (
                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  {bestMove.title}
                </h2>
              ) : (
                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  You are on track
                </h2>
              )}
            </div>
          </div>

          {bestMove ? (
            <>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {bestMove.action}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 font-semibold text-primary">
                  <TrendingUp
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                  +{bestMove.estimatedScoreIncrease} points
                </span>

                <span className="rounded-full border bg-background px-2.5 py-1 capitalize text-muted-foreground">
                  {bestMove.importance} skill
                </span>
              </div>

              <button
                type="button"
                onClick={() => onNavigate("next-steps")}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                View Next Steps
                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </button>
            </>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Every modeled requirement for {role.title} is
              covered. Explore the Career Map to see how your
              work connects.
            </p>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Top priority gaps
            </p>

            <span className="text-xs font-medium text-muted-foreground">
              {topGaps.length}
            </span>
          </div>

          {topGaps.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {topGaps.map((gap) => {
                const status =
                  gapStatusConfig[gap.currentStatus];

                const StatusIcon = status.icon;

                return (
                  <li
                    key={gap.id}
                    className="flex items-center gap-3"
                  >
                    <StatusIcon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        status.className,
                      )}
                      aria-hidden="true"
                    />

                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                      {gap.skillName}
                    </span>

                    <span
                      className={cn(
                        "text-xs font-medium",
                        status.className,
                      )}
                    >
                      {status.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No outstanding gaps for this role.
            </p>
          )}

          <button
            type="button"
            onClick={() => onNavigate("skill-gaps")}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            View Skill Gaps
            <ArrowRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>
        </section>
      </div>

      <section>
        <DashboardAction
          label="Explore Career Map"
          onClick={() => onNavigate("career-map")}
        />
      </section>
    </div>
  );
}

type ReadinessStatProps = {
  label: string;
  value: number;
  className: string;
};

function ReadinessStat({
  label,
  value,
  className,
}: ReadinessStatProps) {
  return (
    <div className="rounded-2xl border bg-background/80 p-3 text-center">
      <dt className="sr-only">{label}</dt>

      <dd
        className={cn(
          "text-2xl font-bold",
          className,
        )}
      >
        {value}
      </dd>

      <p className="mt-1 text-xs text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

type DashboardActionProps = {
  label: string;
  onClick: () => void;
};

function DashboardAction({
  label,
  onClick,
}: DashboardActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-3 rounded-2xl border bg-card px-5 py-4 text-left text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5 sm:w-80"
    >
      {label}

      <ArrowRight
        className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
        aria-hidden="true"
      />
    </button>
  );
}
