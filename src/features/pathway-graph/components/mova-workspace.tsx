"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  careerRoles,
  defaultCareerRoleId,
  getCareerRole,
} from "@/features/goals/data/career-roles";

import {
  WorkspaceLoadError,
  WorkspaceLoadingState,
} from "@/features/persistence/components/workspace-load-state";

import { useWorkspacePersistence } from
  "@/features/persistence/hooks/use-workspace-persistence";
import type { PersistedWorkspace } from
  "@/features/persistence/types/workspace";

import { calculateReadiness } from
  "@/features/readiness/services/calculate-readiness";

import { generateRecommendations } from
  "@/features/recommendations/services/generate-recommendations";
import type { NextMoveRecommendation } from
  "@/features/recommendations/types/recommendation";

import { simulateRecommendation } from
  "@/features/scenario-simulator/services/simulate-recommendation";

import { applyApprovedProfileItem } from
  "@/features/skill-analysis/services/apply-profile-item-extraction";
import type { ApprovedProfileItem } from
  "@/features/skill-analysis/types/profile-item-extraction";

import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";
import { reconcileProfileSkills } from
  "@/features/student-profile/utils/reconcile-profile-skills";

import { WorkspaceShell } from
  "@/features/workspace/components/workspace-shell";
import { CareerMapView } from
  "@/features/workspace/components/views/career-map-view";
import { DashboardView } from
  "@/features/workspace/components/views/dashboard-view";
import { NextStepsView } from
  "@/features/workspace/components/views/next-steps-view";
import { ProfileView } from
  "@/features/workspace/components/views/profile-view";
import { SkillGapsView } from
  "@/features/workspace/components/views/skill-gaps-view";
import { WhatIfView } from
  "@/features/workspace/components/views/what-if-view";
import {
  DEFAULT_WORKSPACE_VIEW,
  type WorkspaceView,
} from "@/features/workspace/types/workspace-view";

import { sampleStudentProfile } from
  "../data/sample-student";

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

  const [activeView, setActiveView] =
    useState<WorkspaceView>(
      DEFAULT_WORKSPACE_VIEW,
    );

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
      ) => {
        const isTogglingOff =
          currentRecommendationId ===
          recommendation.id;

        if (!isTogglingOff) {
          setActiveView("what-if");
        }

        return isTogglingOff
          ? null
          : recommendation.id;
      },
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
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md">
          <WorkspaceLoadingState />
        </div>
      </div>
    );
  }
  
  if (
    persistence.hydrationStatus ===
    "error"
  ) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md">
          <WorkspaceLoadError
            error={persistence.error}
            onRetry={
              persistence.retryHydration
            }
            onContinueLocally={
              persistence.continueWithoutPersistence
            }
          />
        </div>
      </div>
    );
  }

  return (
    <WorkspaceShell
      activeView={activeView}
      onNavigate={setActiveView}
      saveStatus={persistence.status}
      lastSavedAt={
        persistence.lastSavedAt
      }
      saveError={persistence.error}
    >
      {activeView === "dashboard" ? (
        <DashboardView
          profile={profile}
          role={selectedRole}
          roles={careerRoles}
          onRoleSelect={
            handleRoleSelect
          }
          assessment={
            readinessAssessment
          }
          recommendations={
            recommendations
          }
          onNavigate={setActiveView}
        />
      ) : null}

      {activeView === "career-map" ? (
        <CareerMapView
          profile={graphProfile}
          role={selectedRole}
          recommendations={
            graphRecommendations
          }
          isScenarioPreview={
            activeScenario !== null
          }
        />
      ) : null}

      {activeView === "skill-gaps" ? (
        <SkillGapsView
          role={selectedRole}
          assessment={
            readinessAssessment
          }
        />
      ) : null}

      {activeView === "next-steps" ? (
        <NextStepsView
          roleTitle={
            selectedRole.title
          }
          recommendations={
            recommendations
          }
          activeRecommendationId={
            activeRecommendationId
          }
          onSimulate={handleSimulate}
        />
      ) : null}

      {activeView === "what-if" ? (
        <WhatIfView
          roleTitle={
            selectedRole.title
          }
          scenario={activeScenario}
          onClear={() =>
            setActiveRecommendationId(
              null,
            )
          }
          onNavigate={setActiveView}
        />
      ) : null}

      {activeView === "profile" ? (
        <ProfileView
          profile={profile}
          onProfileChange={
            handleProfileChange
          }
          onRestoreDemo={restoreDemo}
          onAddExtractedItem={
            handleAddExtractedItem
          }
        />
      ) : null}
    </WorkspaceShell>
  );
}