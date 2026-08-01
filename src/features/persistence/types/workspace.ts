import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";

export type WorkspaceSnapshot = {
  version: 1;
  profile: StudentProfile;
  selectedRoleId: string;
};

export type PersistedWorkspace =
  WorkspaceSnapshot & {
    id: string;
    createdAt: string;
    updatedAt: string;
  };

export type WorkspaceSaveStatus =
  | "loading"
  | "saving"
  | "saved"
  | "error";