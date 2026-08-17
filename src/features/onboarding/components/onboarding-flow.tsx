"use client";

import { useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Lightbulb,
  PartyPopper,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { CareerRoleSelector } from
  "@/features/goals/components/career-role-selector";
import type { CareerRole } from
  "@/features/goals/types/career-role";
import type { ReadinessAssessment } from
  "@/features/readiness/types/readiness";
import type { NextMoveRecommendation } from
  "@/features/recommendations/types/recommendation";
import { ProfileExtractionReview } from
  "@/features/skill-analysis/components/profile-extraction-review";
import type { ApprovedProfileItem } from
  "@/features/skill-analysis/types/profile-item-extraction";
import { ResumeImportWizard } from
  "@/features/resume-import/components/resume-import-wizard";
import { ResumeMissingCheckpoint } from
  "@/features/resume-import/components/resume-missing-checkpoint";
import { ResumeStartChoice } from
  "@/features/resume-import/components/resume-start-choice";
import { StudentProfileForm } from
  "@/features/student-profile/components/student-profile-form";
import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";
import { hasProfileEvidence } from
  "../services/resume-onboarding-step";

import type { OnboardingStep } from "../types/onboarding";
import { OnboardingProgress } from "./onboarding-progress";

type OnboardingFlowProps = {
  userEmail: string | null;
  profile: StudentProfile;
  roles: CareerRole[];
  selectedRole: CareerRole;
  selectedRoleId: string;
  assessment: ReadinessAssessment;
  recommendations: NextMoveRecommendation[];
  onRoleSelect: (roleId: string) => void;
  onProfileChange: (profile: StudentProfile) => void;
  onAddExtractedItem: (item: ApprovedProfileItem) => void;
  onRestoreDemo: () => void;
  currentStep: OnboardingStep;
  onStepChange: (step: OnboardingStep) => void;
  onFinish: () => void;
};

type InteractiveStep = Exclude<OnboardingStep, "account">;

function toInteractiveStep(
  step: OnboardingStep,
): InteractiveStep {
  return step === "account" ? "build-profile" : step;
}

export function OnboardingFlow({
  userEmail,
  profile,
  roles,
  selectedRole,
  selectedRoleId,
  assessment,
  recommendations,
  onRoleSelect,
  onProfileChange,
  onAddExtractedItem,
  onRestoreDemo,
  currentStep,
  onStepChange,
  onFinish,
}: OnboardingFlowProps) {
  const [visibleStep, setVisibleStep] =
    useState<InteractiveStep>(() =>
      toInteractiveStep(currentStep),
    );

  const [startPath, setStartPath] = useState<
    "choice" | "import" | "manual"
  >(() => (hasProfileEvidence(profile) ? "manual" : "choice"));
  const [showMissing, setShowMissing] = useState(false);

  const goTo = (step: InteractiveStep) => {
    setVisibleStep(step);
    onStepChange(step);
  };

  const goBack = (step: InteractiveStep) => {
    setVisibleStep(step);
  };

  return (
    <main className="min-h-dvh bg-muted/30 px-4 py-10 sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="space-y-1">
          <p className="font-heading text-xl font-semibold text-foreground">
            Welcome to Mova
          </p>
          <p className="text-sm text-muted-foreground">
            Let&apos;s set up your pathway
            {userEmail ? ` for ${userEmail}` : ""}.
          </p>
        </header>

        <OnboardingProgress currentStep={visibleStep} />

        {visibleStep === "career-goal" ? (
          <StepShell
            title="Great — now where are you trying to go?"
            description="Pick the role you want to work towards. You can change this any time."
          >
            <CareerRoleSelector
              roles={roles}
              selectedRoleId={selectedRoleId}
              onSelect={onRoleSelect}
            />

            <StepNav
              onBack={() => goBack("build-profile")}
              onContinue={() => goTo("review-path")}
            />
          </StepShell>
        ) : null}

        {visibleStep === "build-profile" ? (
          <StepShell
            title="Build your profile"
            description="Mova works best when it understands what you've already done."
          >
            {startPath === "choice" ? (
              <ResumeStartChoice
                onImport={() => setStartPath("import")}
                onManual={() => setStartPath("manual")}
              />
            ) : null}

            {startPath === "import" ? (
              <ResumeImportWizard
                baselineProfile={profile}
                mode="onboarding"
                onApproved={(nextProfile) => {
                  onProfileChange(nextProfile);
                  goTo("career-goal");
                }}
                onCancel={() =>
                  setStartPath(
                    hasProfileEvidence(profile) ? "manual" : "choice",
                  )
                }
              />
            ) : null}

            {startPath === "manual" ? (
              <>
                <ProfileExtractionReview
                  onAdd={onAddExtractedItem}
                />

                <StudentProfileForm
                  profile={profile}
                  onChange={onProfileChange}
                  onRestoreDemo={onRestoreDemo}
                />

                {showMissing ? (
                  <ResumeMissingCheckpoint
                    onAddSomething={() => setShowMissing(false)}
                    onLooksRight={() => goTo("career-goal")}
                  />
                ) : (
                  <StepNav
                    onContinue={() => setShowMissing(true)}
                  />
                )}
              </>
            ) : null}
          </StepShell>
        ) : null}

        {visibleStep === "review-path" ? (
          <StepShell
            title="Review your path"
            description={`Here is where you stand for ${selectedRole.title} right now.`}
          >
            <ReviewSummary
              role={selectedRole}
              assessment={assessment}
              recommendations={recommendations}
            />

            <StepNav
              onBack={() => goBack("career-goal")}
              onContinue={() => goTo("finish")}
            />
          </StepShell>
        ) : null}

        {visibleStep === "finish" ? (
          <StepShell
            title="You're all set"
            description="Your workspace is ready. You can keep refining your profile and explore your full pathway on the dashboard."
          >
            <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <PartyPopper
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </span>

              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">
                  {selectedRole.title}: {assessment.score}% ready
                </p>
                <p className="text-sm text-muted-foreground">
                  Onboarding complete. Let&apos;s make every move
                  count.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => goBack("review-path")}
              >
                <ArrowLeft aria-hidden="true" />
                Back
              </Button>

              <Button size="lg" onClick={onFinish}>
                Enter dashboard
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </StepShell>
        ) : null}
      </div>
    </main>
  );
}

type StepShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function StepShell({
  title,
  description,
  children,
}: StepShellProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}

type StepNavProps = {
  onBack?: () => void;
  onContinue: () => void;
};

function StepNav({ onBack, onContinue }: StepNavProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      {onBack ? (
        <Button variant="ghost" size="lg" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
          Back
        </Button>
      ) : (
        <span />
      )}

      <Button size="lg" onClick={onContinue}>
        Continue
        <ArrowRight aria-hidden="true" />
      </Button>
    </div>
  );
}

const gapStatusConfig = {
  developing: {
    label: "Developing",
    icon: CircleDashed,
    className: "text-warning",
  },
  missing: {
    label: "Missing",
    icon: CircleAlert,
    className: "text-destructive",
  },
} as const;

type ReviewSummaryProps = {
  role: CareerRole;
  assessment: ReadinessAssessment;
  recommendations: NextMoveRecommendation[];
};

function ReviewSummary({
  role,
  assessment,
  recommendations,
}: ReviewSummaryProps) {
  const topGaps = recommendations.slice(0, 3);
  const bestMove = recommendations[0] ?? null;
  const strongestAreas = assessment.competencies
    .filter((competency) => competency.evidenceStatus === "demonstrated")
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Your starting point
        </p>

        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {role.title}
        </p>

        <div className="mt-2 flex items-baseline gap-3">
          <span className="text-5xl font-bold tracking-tight text-foreground">
            {assessment.score}%
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            readiness
          </span>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-primary/15"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={assessment.score}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${assessment.score}%` }}
          />
        </div>
      </section>

      {strongestAreas.length > 0 ? (
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Strongest areas
          </p>
          <ul className="mt-3 space-y-2">
            {strongestAreas.map((area) => (
              <li key={area.competencyId} className="flex items-center gap-2 text-sm">
                <CircleCheck className="h-4 w-4 text-success" aria-hidden="true" />
                {area.competencyName}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Biggest opportunity
        </p>

        {topGaps.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {topGaps.map((gap) => {
              const status = gapStatusConfig[gap.currentStatus];
              const StatusIcon = status.icon;

              return (
                <li
                  key={gap.id}
                  className="flex items-center gap-3"
                >
                  <StatusIcon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      status.className,
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {gap.competencyName}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      status.className,
                    )}
                  >
                    {status.label}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No outstanding gaps for this role.
          </p>
        )}
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Lightbulb className="h-5 w-5" aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Highest-impact next move
            </p>

            {bestMove ? (
              <>
                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  {bestMove.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {bestMove.action}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary">
                  <TrendingUp
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                  +{bestMove.estimatedScoreIncrease} points
                </span>
              </>
            ) : (
              <h2 className="mt-1 text-lg font-semibold text-foreground">
                You are on track for {role.title}.
              </h2>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
