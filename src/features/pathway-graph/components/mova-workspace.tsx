"use client";

import { useMemo, useState } from "react";

import { CareerRoleSelector } from
  "@/features/goals/components/career-role-selector";
import {
  careerRoles,
  defaultCareerRoleId,
  getCareerRole,
} from "@/features/goals/data/career-roles";
import { ReadinessSummary } from
  "@/features/readiness/components/readiness-summary";
import { calculateReadiness } from
  "@/features/readiness/services/calculate-readiness";
import { RecommendationSummary } from
  "@/features/recommendations/components/recommendation-summary";
import { generateRecommendations } from
  "@/features/recommendations/services/generate-recommendations";
import { StudentProfileForm } from
  "@/features/student-profile/components/student-profile-form";
import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";

import { sampleStudentProfile } from "../data/sample-student";
import { MovaGraph } from "./mova-graph";

function createDemoProfile(): StudentProfile {
  return structuredClone(sampleStudentProfile);
}

export function MovaWorkspace() {
  const [profile, setProfile] =
    useState<StudentProfile>(createDemoProfile);

  const [selectedRoleId, setSelectedRoleId] =
    useState(defaultCareerRoleId);

  const selectedRole = useMemo(
    () => getCareerRole(selectedRoleId),
    [selectedRoleId],
  );

  const readinessAssessment = useMemo(
    () =>
      calculateReadiness(
        profile,
        selectedRole,
      ),
    [profile, selectedRole],
  );

  const recommendations = useMemo(
    () =>
      generateRecommendations(
        readinessAssessment,
      ),
    [readinessAssessment],
  );

  const restoreDemo = () => {
    setProfile(createDemoProfile());
    setSelectedRoleId(defaultCareerRoleId);
  };

  return (
    <div className="space-y-6">
      <CareerRoleSelector
        roles={careerRoles}
        selectedRoleId={selectedRoleId}
        onSelect={setSelectedRoleId}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <StudentProfileForm
          profile={profile}
          onChange={setProfile}
          onRestoreDemo={restoreDemo}
        />

        <div className="min-w-0 space-y-6">
          <ReadinessSummary
            role={selectedRole}
            assessment={readinessAssessment}
          />

          <RecommendationSummary
            roleTitle={selectedRole.title}
            recommendations={recommendations}
          />

          <MovaGraph
            profile={profile}
            role={selectedRole}
            recommendations={recommendations}
          />
        </div>
      </div>
    </div>
  );
}