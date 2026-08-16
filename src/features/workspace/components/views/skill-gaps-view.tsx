"use client";

import type { CareerRole } from "@/features/goals/types/career-role";
import { ReadinessSummary } from "@/features/readiness/components/readiness-summary";
import type { ReadinessAssessment } from "@/features/readiness/types/readiness";

type SkillGapsViewProps = {
  role: CareerRole;
  assessment: ReadinessAssessment;
};

export function SkillGapsView({
  role,
  assessment,
}: SkillGapsViewProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Skill Gaps
        </h1>

        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          See which of {role.title}&apos;s requirements you can
          demonstrate today and where gaps remain.
        </p>
      </header>

      <ReadinessSummary
        role={role}
        assessment={assessment}
      />
    </div>
  );
}
