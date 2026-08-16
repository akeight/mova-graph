"use client";

import type { CareerRole } from "@/features/goals/types/career-role";
import { MovaGraph } from "@/features/pathway-graph/components/mova-graph";
import type { NextMoveRecommendation } from "@/features/recommendations/types/recommendation";
import type { StudentProfile } from "@/features/student-profile/types/student-profile";

type CareerMapViewProps = {
  profile: StudentProfile;
  role: CareerRole;
  recommendations: NextMoveRecommendation[];
  isScenarioPreview: boolean;
};

export function CareerMapView({
  profile,
  role,
  recommendations,
  isScenarioPreview,
}: CareerMapViewProps) {
  return (
    <MovaGraph
      profile={profile}
      role={role}
      recommendations={recommendations}
      isScenarioPreview={isScenarioPreview}
    />
  );
}
