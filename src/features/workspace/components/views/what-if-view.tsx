"use client";

import { ArrowRight } from "lucide-react";

import { ScenarioPreview } from "@/features/scenario-simulator/components/scenario-preview";
import type { RecommendationScenarioResult } from "@/features/scenario-simulator/types/scenario";

import type { WorkspaceView } from "../../types/workspace-view";

type WhatIfViewProps = {
  roleTitle: string;
  scenario: RecommendationScenarioResult | null;
  onClear: () => void;
  onNavigate: (view: WorkspaceView) => void;
};

export function WhatIfView({
  roleTitle,
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
          Preview how completing a recommended move could
          change your readiness for {roleTitle}. Nothing here
          changes your saved profile.
        </p>
      </header>

      <ScenarioPreview
        roleTitle={roleTitle}
        scenario={scenario}
        onClear={onClear}
      />

      {scenario ? (
        <button
          type="button"
          onClick={() => onNavigate("career-map")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          View projected map
          <ArrowRight
            className="h-4 w-4"
            aria-hidden="true"
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onNavigate("next-steps")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Choose a move in Next Steps
          <ArrowRight
            className="h-4 w-4"
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}
