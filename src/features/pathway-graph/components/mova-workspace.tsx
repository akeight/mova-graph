"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import { CareerRoleSelector } from
  "@/features/goals/components/career-role-selector";
import {
  careerRoles,
  defaultCareerRoleId,
  getCareerRole,
} from "@/features/goals/data/career-roles";

import {
  WorkspaceLoadError,
  WorkspaceLoadingState,
} from "@/features/persistence/components/workspace-load-state";

import { WorkspaceSaveStatus } from
  "@/features/persistence/components/workspace-save-status";
import { useWorkspacePersistence } from
  "@/features/persistence/hooks/use-workspace-persistence";
import type { PersistedWorkspace } from
  "@/features/persistence/types/workspace";

import { ReadinessSummary } from
  "@/features/readiness/components/readiness-summary";
import { calculateReadiness } from
  "@/features/readiness/services/calculate-readiness";

import { RecommendationSummary } from
  "@/features/recommendations/components/recommendation-summary";
import { generateRecommendations } from
  "@/features/recommendations/services/generate-recommendations";
import type { NextMoveRecommendation } from
  "@/features/recommendations/types/recommendation";

import { ScenarioPreview } from
  "@/features/scenario-simulator/components/scenario-preview";
import { simulateRecommendation } from
  "@/features/scenario-simulator/services/simulate-recommendation";

import { ProfileExtractionReview } from
  "@/features/skill-analysis/components/profile-extraction-review";
import { applyApprovedProfileItem } from
  "@/features/skill-analysis/services/apply-profile-item-extraction";
import type { ApprovedProfileItem } from
  "@/features/skill-analysis/types/profile-item-extraction";

import { StudentProfileForm } from
  "@/features/student-profile/components/student-profile-form";
import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";
import { reconcileProfileSkills } from
  "@/features/student-profile/utils/reconcile-profile-skills";

import { sampleStudentProfile } from
  "../data/sample-student";

import { MovaGraph } from
  "./mova-graph";

function createDemoProfile(): StudentProfile {
  return structuredClone(
    sampleStudentProfile,
  );
}

export function MovaWorkspace() {
  const [profile, setProfile] =
    useState<StudentProfile>(
      createDemoProfile,
    );

  const [
    selectedRoleId,
    setSelectedRoleId,
  ] = useState(defaultCareerRoleId);

  const [
    activeRecommendationId,
    setActiveRecommendationId,
  ] = useState<string | null>(null);

  const handleWorkspaceHydrate =
    useCallback(
      (
        workspace:
          PersistedWorkspace,
      ) => {
        setProfile(
          reconcileProfileSkills(
            workspace.profile,
          ),
        );

        setSelectedRoleId(
          workspace.selectedRoleId,
        );

        setActiveRecommendationId(
          null,
        );
      },
      [],
    );

  const selectedRole = useMemo(
    () =>
      getCareerRole(
        selectedRoleId,
      ),
    [selectedRoleId],
  );

  const readinessAssessment =
    useMemo(
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

  const activeRecommendation =
    useMemo(
      () =>
        recommendations.find(
          (recommendation) =>
            recommendation.id ===
            activeRecommendationId,
        ) ?? null,
      [
        activeRecommendationId,
        recommendations,
      ],
    );

  const activeScenario = useMemo(
    () =>
      activeRecommendation
        ? simulateRecommendation(
            profile,
            selectedRole,
            activeRecommendation,
          )
        : null,
    [
      activeRecommendation,
      profile,
      selectedRole,
    ],
  );

  const graphProfile = useMemo(
    () =>
      activeScenario
        ? reconcileProfileSkills(
            activeScenario
              .projectedProfile,
          )
        : profile,
    [activeScenario, profile],
  );

  const graphRecommendations =
    useMemo(
      () =>
        activeScenario
          ? recommendations.filter(
              (recommendation) =>
                recommendation.id !==
                activeScenario
                  .recommendation.id,
            )
          : recommendations,
      [
        activeScenario,
        recommendations,
      ],
    );

  const persistence =
    useWorkspacePersistence({
      profile,
      selectedRoleId,
      onHydrate:
        handleWorkspaceHydrate,
    });

  const handleProfileChange = (
    nextProfile: StudentProfile,
  ) => {
    setProfile(nextProfile);

    setActiveRecommendationId(
      null,
    );
  };

  const handleRoleSelect = (
    roleId: string,
  ) => {
    setSelectedRoleId(roleId);

    setActiveRecommendationId(
      null,
    );
  };

  const handleSimulate = (
    recommendation:
      NextMoveRecommendation,
  ) => {
    setActiveRecommendationId(
      (
        currentRecommendationId,
      ) =>
        currentRecommendationId ===
        recommendation.id
          ? null
          : recommendation.id,
    );
  };

  const handleAddExtractedItem = (
    item: ApprovedProfileItem,
  ) => {
    const updatedProfile =
      applyApprovedProfileItem(
        profile,
        item,
      );

    handleProfileChange(
      updatedProfile,
    );
  };

  const restoreDemo = () => {
    setProfile(
      createDemoProfile(),
    );

    setSelectedRoleId(
      defaultCareerRoleId,
    );

    setActiveRecommendationId(
      null,
    );
  };
  
  if (
    persistence.hydrationStatus ===
    "loading"
  ) {
    return <WorkspaceLoadingState />;
  }
  
  if (
    persistence.hydrationStatus ===
    "error"
  ) {
    return (
      <WorkspaceLoadError
        error={persistence.error}
        onRetry={
          persistence.retryHydration
        }
        onContinueLocally={
          persistence.continueWithoutPersistence
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <CareerRoleSelector
        roles={careerRoles}
        selectedRoleId={
          selectedRoleId
        }
        onSelect={
          handleRoleSelect
        }
      />

      <div className="flex justify-end">
        <WorkspaceSaveStatus
          status={
            persistence.status
          }
          lastSavedAt={
            persistence.lastSavedAt
          }
          error={
            persistence.error
          }
        />
      </div>

      <ProfileExtractionReview
        onAdd={
          handleAddExtractedItem
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <StudentProfileForm
          profile={profile}
          onChange={
            handleProfileChange
          }
          onRestoreDemo={
            restoreDemo
          }
        />

        <div className="min-w-0 space-y-6">
          <ReadinessSummary
            role={selectedRole}
            assessment={
              readinessAssessment
            }
          />

          <RecommendationSummary
            roleTitle={
              selectedRole.title
            }
            recommendations={
              recommendations
            }
            activeRecommendationId={
              activeRecommendationId
            }
            onSimulate={
              handleSimulate
            }
          />

          <ScenarioPreview
            roleTitle={
              selectedRole.title
            }
            scenario={
              activeScenario
            }
            onClear={() =>
              setActiveRecommendationId(
                null,
              )
            }
          />

          <MovaGraph
            profile={
              graphProfile
            }
            role={selectedRole}
            recommendations={
              graphRecommendations
            }
            isScenarioPreview={
              activeScenario !==
              null
            }
          />
        </div>
      </div>
    </div>
  );
}