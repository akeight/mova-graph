"use client";

import { ProfileExtractionReview } from "@/features/skill-analysis/components/profile-extraction-review";
import type { ApprovedProfileItem } from "@/features/skill-analysis/types/profile-item-extraction";
import { StudentProfileForm } from "@/features/student-profile/components/student-profile-form";
import type { StudentProfile } from "@/features/student-profile/types/student-profile";

type ProfileViewProps = {
  profile: StudentProfile;
  onProfileChange: (profile: StudentProfile) => void;
  onRestoreDemo: () => void;
  onAddExtractedItem: (
    item: ApprovedProfileItem,
  ) => void;
};

export function ProfileView({
  profile,
  onProfileChange,
  onRestoreDemo,
  onAddExtractedItem,
}: ProfileViewProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Profile
        </h1>

        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Edit your courses, experiences, and skills. Changes
          update your readiness, gaps, and recommendations
          automatically.
        </p>
      </header>

      <ProfileExtractionReview onAdd={onAddExtractedItem} />

      <StudentProfileForm
        profile={profile}
        onChange={onProfileChange}
        onRestoreDemo={onRestoreDemo}
      />
    </div>
  );
}
