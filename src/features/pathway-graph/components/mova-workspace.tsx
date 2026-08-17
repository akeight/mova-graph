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

import { OnboardingFlow } from
  "@/features/onboarding/components/onboarding-flow";
import {
  advanceOnboarding,
  completeOnboarding,
  initialOnboarding,
} from "@/features/onboarding/services/onboarding-state";
import { resumeOnboardingStep } from
  "@/features/onboarding/services/resume-onboarding-step";
import type {
  OnboardingState,
  OnboardingStep,
} from "@/features/onboarding/types/onboarding";

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
import { createEmptyProfile } from
  "@/features/student-profile/utils/create-empty-profile";
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

function deriveNameFromEmail(
  userEmail: string | null,
): string {
  const localPart = userEmail
    ?.split("@")[0]
    ?.trim();

  return localPart && localPart.length > 0
    ? localPart
    : "New student";
}

function isDevAccount(
  userEmail: string | null,
): boolean {
  if (process.env.NODE_ENV !== "development") {
    return false;
  }

  const devEmail =
    process.env.NEXT_PUBLIC_DEV_ACCOUNT_EMAIL
      ?.trim()
      .toLowerCase();

  if (!devEmail) {
    return false;
  }

  return (
    userEmail?.trim().toLowerCase() === devEmail
  );
}

/**
 * Genuinely new users start from a clean, empty profile. In development, a
 * designated dev account seeds the demo profile instead for convenience.
 */
function createInitialProfile(
  userEmail: string | null,
): StudentProfile {
  if (isDevAccount(userEmail)) {
    return createDemoProfile();
  }

  return createEmptyProfile({
    name: deriveNameFromEmail(userEmail),
  });
}

type MovaWorkspaceProps = {
  userEmail: string | null;
};

export function MovaWorkspace({
  userEmail,
}: MovaWorkspaceProps) {
  const [profile, setProfile] =
    useState<StudentProfile>(
      () => createInitialProfile(userEmail),
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

  const [onboarding, setOnboarding] =
    useState<OnboardingState>(
      initialOnboarding,
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

        setOnboarding({
          ...workspace.onboarding,
          step: resumeOnboardingStep(
            workspace.onboarding,
            workspace.profile,
          ),
        });

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
      generateRecommendations({
        profile,
        role: selectedRole,
      }),
    [profile, selectedRole],
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
      onboarding,
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

  const handleOnboardingStepChange = (
    step: OnboardingStep,
  ) => {
    setOnboarding((current) =>
      advanceOnboarding(current, step),
    );
  };

  const handleOnboardingComplete = () => {
    setOnboarding((current) =>
      completeOnboarding(current),
    );

    setActiveView(DEFAULT_WORKSPACE_VIEW);
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

  if (!onboarding.completed) {
    return (
      <OnboardingFlow
        userEmail={userEmail}
        profile={profile}
        roles={careerRoles}
        selectedRole={selectedRole}
        selectedRoleId={selectedRoleId}
        assessment={readinessAssessment}
        recommendations={recommendations}
        onRoleSelect={handleRoleSelect}
        onProfileChange={handleProfileChange}
        onAddExtractedItem={
          handleAddExtractedItem
        }
        onRestoreDemo={restoreDemo}
        currentStep={onboarding.step}
        onStepChange={
          handleOnboardingStepChange
        }
        onFinish={handleOnboardingComplete}
      />
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
      userEmail={userEmail}
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