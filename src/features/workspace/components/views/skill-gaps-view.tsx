"use client";

import type { CareerRole } from "@/features/goals/types/career-role";
import { ReadinessSummary } from "@/features/readiness/components/readiness-summary";
import type { ReadinessAssessment } from "@/features/readiness/types/readiness";

import { PathContinueNav } from "../path-continue-nav";
import type { WorkspaceView } from "../../types/workspace-view";

type SkillGapsViewProps = {
  role: CareerRole;
  assessment: ReadinessAssessment;
  onNavigate: (view: WorkspaceView) => void;
  onAddEvidence: (skillId?: string) => void;
};

export function SkillGapsView({
  role,
  assessment,
  onNavigate,
  onAddEvidence,
}: SkillGapsViewProps) {
  return (
    <div className="min-w-0 space-y-6 overflow-x-clip">
      <header className="space-y-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Skill Gaps
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            See which of {role.title}&apos;s competencies you can
            demonstrate today and where gaps remain.
          </p>
        </div>

        <PathContinueNav
          current="skill-gaps"
          onNavigate={onNavigate}
          onAddEvidence={() => onAddEvidence()}
        />
      </header>

      <ReadinessSummary
        role={role}
        assessment={assessment}
        onAddEvidence={onAddEvidence}
      />
    </div>
  );
}
