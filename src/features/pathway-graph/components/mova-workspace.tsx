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
  initialOnboarding as createInitialOnboardingState,
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
import { ProfileExtractionReview } from
  "@/features/skill-analysis/components/profile-extraction-review";

import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";
import type { ProfileAction } from
  "@/features/student-profile/types/profile-action";
import { profileActionForSuggestedEvidence } from
  "@/features/student-profile/types/profile-action";
import { ProfileActionDrawer } from
  "@/features/student-profile/components/profile-action-drawer";
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { GraphNodeAction } from
  "../builders/resolve-graph-node-action";

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
  persistenceEnabled?: boolean;
  initialProfile?: StudentProfile;
  initialOnboarding?: OnboardingState;
  initialSelectedRoleId?: string;
  showRestoreDemo?: boolean;
  accountVariant?: "authenticated" | "demo";
};

export function MovaWorkspace({
  userEmail,
  persistenceEnabled = true,
  initialProfile,
  initialOnboarding,
  initialSelectedRoleId,
  showRestoreDemo = true,
  accountVariant = "authenticated",
}: MovaWorkspaceProps) {
  const [profile, setProfile] =
    useState<StudentProfile>(
      () => initialProfile ?? createInitialProfile(userEmail),
    );

  const [
    selectedRoleId,
    setSelectedRoleId,
  ] = useState(initialSelectedRoleId ?? defaultCareerRoleId);

  const [
    activeRecommendationId,
    setActiveRecommendationId,
  ] = useState<string | null>(null);

  const [activeView, setActiveView] =
    useState<WorkspaceView>(
      DEFAULT_WORKSPACE_VIEW,
    );

  const [profileAction, setProfileAction] =
    useState<ProfileAction | null>(null);

  const [aiAssistantOpen, setAiAssistantOpen] =
    useState(false);

  const [onboarding, setOnboarding] =
    useState<OnboardingState>(
      () => initialOnboarding ?? createInitialOnboardingState(),
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
      enabled: persistenceEnabled,
      onHydrate:
        handleWorkspaceHydrate,
    });

  const handleNavigate = (
    view: WorkspaceView,
  ) => {
    setActiveView(view);
    setProfileAction(null);
  };

  const handleProfileChange = (
    nextProfile: StudentProfile,
  ) => {
    setProfile(nextProfile);

    setActiveRecommendationId(
      null,
    );
  };

  const handleAddEvidence = (
    skillIds?: string[],
  ) => {
    if (!skillIds || skillIds.length === 0) {
      setProfileAction({ mode: "quick-add" });
      return;
    }

    setProfileAction(
      profileActionForSuggestedEvidence(skillIds),
    );
  };

  const handleSkillEvidence = (
    skillId: string,
    intent: "add" | "manage" = "manage",
  ) => {
    setProfileAction({
      mode: "manage-skill-evidence",
      skillId,
      intent,
    });
  };

  const handleNodeActivate = (
    action: GraphNodeAction,
  ) => {
    if (action.type === "none") {
      return;
    }

    if (action.type === "navigate") {
      handleNavigate(action.view);
      return;
    }

    if (action.type === "edit-activity") {
      setProfileAction({
        mode: "edit-activity",
        itemKind: action.itemKind,
        itemId: action.itemId,
      });
      return;
    }

    handleSkillEvidence(action.skillId, "manage");
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
          handleNavigate("what-if");
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
    setProfileAction(null);
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
        onRestoreDemo={
          showRestoreDemo ? restoreDemo : undefined
        }
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
      onNavigate={handleNavigate}
      saveStatus={persistence.status}
      lastSavedAt={
        persistence.lastSavedAt
      }
      saveError={persistence.error}
      userEmail={userEmail}
      accountVariant={accountVariant}
      showSaveStatus={persistenceEnabled}
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
          onNavigate={handleNavigate}
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
          onNavigate={handleNavigate}
          onNodeActivate={handleNodeActivate}
        />
      ) : null}

      {activeView === "skill-gaps" ? (
        <SkillGapsView
          role={selectedRole}
          assessment={
            readinessAssessment
          }
          onNavigate={handleNavigate}
          onAddEvidence={(skillId) => {
            if (skillId) {
              handleSkillEvidence(skillId, "add");
              return;
            }

            handleAddEvidence();
          }}
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
          onNavigate={handleNavigate}
          onAddEvidence={handleAddEvidence}
        />
      ) : null}

      {activeView === "what-if" ? (
        <WhatIfView
          profile={profile}
          role={selectedRole}
          scenario={activeScenario}
          onClear={() =>
            setActiveRecommendationId(
              null,
            )
          }
          onNavigate={handleNavigate}
          onAddEvidence={() =>
            handleAddEvidence()
          }
        />
      ) : null}

      {activeView === "profile" ? (
        <ProfileView
          profile={profile}
          onProfileChange={
            handleProfileChange
          }
          onRestoreDemo={
          showRestoreDemo ? restoreDemo : undefined
        }
          onAddExtractedItem={
            handleAddExtractedItem
          }
          onManageEvidence={(skillId) =>
            handleSkillEvidence(skillId, "manage")
          }
        />
      ) : null}

      <ProfileActionDrawer
        action={profileAction}
        profile={profile}
        onProfileChange={handleProfileChange}
        onActionChange={setProfileAction}
        onOpenAiAssistant={() => {
          setProfileAction(null);
          window.setTimeout(() => {
            setAiAssistantOpen(true);
          }, 100);
        }}
      />

      <Dialog
        open={aiAssistantOpen}
        onOpenChange={setAiAssistantOpen}
      >
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"
        >
          <DialogHeader>
            <DialogTitle>AI profile assistant</DialogTitle>
            <DialogDescription>
              Describe a course or experience. Review every suggestion
              before adding it to your Mova profile.
            </DialogDescription>
          </DialogHeader>
          <ProfileExtractionReview
            onAdd={(item) => {
              handleAddExtractedItem(item);
              setAiAssistantOpen(false);
              setProfileAction(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </WorkspaceShell>
  );
}