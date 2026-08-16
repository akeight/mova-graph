import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";
import type { OnboardingState } from
  "@/features/onboarding/types/onboarding";

export type WorkspaceSnapshot = {
  version: 2;
  profile: StudentProfile;
  selectedRoleId: string;
  onboarding: OnboardingState;
};

export type PersistedWorkspace =
  WorkspaceSnapshot & {
    id: string;
    createdAt: string;
    updatedAt: string;
  };

export type WorkspaceHydrationStatus =
  | "loading"
  | "ready"
  | "error"
  | "local-only";

export type WorkspaceSaveStatus =
  | "loading"
  | "saving"
  | "saved"
  | "error"
  | "local-only";
