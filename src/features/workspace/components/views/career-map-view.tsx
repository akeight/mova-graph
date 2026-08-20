"use client";

import type { CareerRole } from "@/features/goals/types/career-role";
import { MovaGraph } from "@/features/pathway-graph/components/mova-graph";
import type { GraphNodeAction } from
  "@/features/pathway-graph/builders/resolve-graph-node-action";
import type { NextMoveRecommendation } from "@/features/recommendations/types/recommendation";
import type { StudentProfile } from "@/features/student-profile/types/student-profile";

import { PathContinueNav } from "../path-continue-nav";
import type { WorkspaceView } from "../../types/workspace-view";

type CareerMapViewProps = {
  profile: StudentProfile;
  role: CareerRole;
  recommendations: NextMoveRecommendation[];
  isScenarioPreview: boolean;
  onNavigate: (view: WorkspaceView) => void;
  onNodeActivate: (action: GraphNodeAction) => void;
};

export function CareerMapView({
  profile,
  role,
  recommendations,
  isScenarioPreview,
  onNavigate,
  onNodeActivate,
}: CareerMapViewProps) {
  return (
    <div className="space-y-4">
      <PathContinueNav
        current="career-map"
        onNavigate={onNavigate}
      />
      <MovaGraph
        profile={profile}
        role={role}
        recommendations={recommendations}
        isScenarioPreview={isScenarioPreview}
        onNodeActivate={onNodeActivate}
      />
    </div>
  );
}
