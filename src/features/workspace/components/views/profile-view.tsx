"use client";

import { useState } from "react";

import { ResumeImportWizard } from
  "@/features/resume-import/components/resume-import-wizard";
import { ProfileExtractionReview } from
  "@/features/skill-analysis/components/profile-extraction-review";
import type { ApprovedProfileItem } from
  "@/features/skill-analysis/types/profile-item-extraction";
import { StudentProfileForm } from
  "@/features/student-profile/components/student-profile-form";
import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";

type ProfileViewProps = {
  profile: StudentProfile;
  onProfileChange: (profile: StudentProfile) => void;
  onRestoreDemo: () => void;
  onAddExtractedItem: (
    item: ApprovedProfileItem,
  ) => void;
  onManageEvidence?: (skillId: string) => void;
};

export function ProfileView({
  profile,
  onProfileChange,
  onRestoreDemo,
  onAddExtractedItem,
  onManageEvidence,
}: ProfileViewProps) {
  const [importing, setImporting] = useState(false);

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

      <section className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
        <div>
          <h2 className="text-sm font-semibold">Add more evidence</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Import another resume or add items yourself. Later imports
            are reviewed before anything is added.
          </p>
        </div>

        {importing ? (
          <ResumeImportWizard
            baselineProfile={profile}
            mode="later"
            onApproved={(nextProfile) => {
              onProfileChange(nextProfile);
              setImporting(false);
            }}
            onCancel={() => setImporting(false)}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setImporting(true)}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              Import another resume
            </button>
            <span className="self-center text-xs text-muted-foreground">
              or add manually below
            </span>
          </div>
        )}
      </section>

      <ProfileExtractionReview onAdd={onAddExtractedItem} />

      <StudentProfileForm
        profile={profile}
        onChange={onProfileChange}
        onRestoreDemo={onRestoreDemo}
        onManageEvidence={onManageEvidence}
      />
    </div>
  );
}
