"use client";

import { ArrowRight } from "lucide-react";

import type { CareerRole } from "@/features/goals/types/career-role";
import { OpportunityWhatIfFlow } from
  "@/features/opportunity-what-if/components/opportunity-what-if-flow";
import { ScenarioPreview } from "@/features/scenario-simulator/components/scenario-preview";
import type { RecommendationScenarioResult } from "@/features/scenario-simulator/types/scenario";
import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";

import type { WorkspaceView } from "../../types/workspace-view";

type WhatIfViewProps = {
  profile: StudentProfile;
  role: CareerRole;
  scenario: RecommendationScenarioResult | null;
  onClear: () => void;
  onNavigate: (view: WorkspaceView) => void;
};

export function WhatIfView({
  profile,
  role,
  scenario,
  onClear,
  onNavigate,
}: WhatIfViewProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          What If?
        </h1>

        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          See how completing an opportunity could change your readiness
          for {role.title}. Nothing here changes your saved profile.
        </p>
      </header>

      {scenario ? (
        <>
          <ScenarioPreview
            roleTitle={role.title}
            scenario={scenario}
            onClear={onClear}
          />
          <button
            type="button"
            onClick={() => onNavigate("career-map")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            View projected map
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </>
      ) : null}

      <OpportunityWhatIfFlow
        profile={profile}
        role={role}
        onAnalyzeStart={onClear}
      />
    </div>
  );
}
