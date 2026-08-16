"use client";

import { RecommendationSummary } from "@/features/recommendations/components/recommendation-summary";
import type { NextMoveRecommendation } from "@/features/recommendations/types/recommendation";

type NextStepsViewProps = {
  roleTitle: string;
  recommendations: NextMoveRecommendation[];
  activeRecommendationId: string | null;
  onSimulate: (
    recommendation: NextMoveRecommendation,
  ) => void;
};

export function NextStepsView({
  roleTitle,
  recommendations,
  activeRecommendationId,
  onSimulate,
}: NextStepsViewProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Next Steps
        </h1>

        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The moves that create the most progress toward{" "}
          {roleTitle}. Preview any move to see its impact in
          What If?
        </p>
      </header>

      <RecommendationSummary
        roleTitle={roleTitle}
        recommendations={recommendations}
        activeRecommendationId={activeRecommendationId}
        onSimulate={onSimulate}
      />
    </div>
  );
}
