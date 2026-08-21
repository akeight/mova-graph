"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DEMO_DEFAULT_CAREER_ROLE_ID,
  DEMO_RESUME_DISPLAY_NAME,
  DEMO_RESUME_SOURCE_ID,
  DEMO_RESUME_TEXT,
  createDemoBaselineProfile,
  createExploredDemoOnboarding,
  createExploredDemoProfile,
} from "@/features/demo/data/demo-resume";
import { advanceOnboarding, initialOnboarding } from
  "@/features/onboarding/services/onboarding-state";
import { MovaWorkspace } from
  "@/features/pathway-graph/components/mova-workspace";
import { ResumeImportWizard } from
  "@/features/resume-import/components/resume-import-wizard";
import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";
import {
  WorkspaceRuntimeProvider,
  demoWorkspaceRuntime,
} from "@/features/workspace/runtime/workspace-runtime";
import { LANDING_PATH } from "@/lib/app-routes";

type DemoPhase = "chooser" | "resume" | "workspace";

type WorkspaceSeed = {
  profile: StudentProfile;
  onboarding: ReturnType<typeof initialOnboarding>;
};

export function PublicDemoPage({
  sessionEmail = null,
}: {
  sessionEmail?: string | null;
}) {
  const [resetKey, setResetKey] = useState(0);

  return (
    <WorkspaceRuntimeProvider value={demoWorkspaceRuntime} key={resetKey}>
      <DemoWorkspace
        sessionEmail={sessionEmail}
        onReset={() => setResetKey((current) => current + 1)}
      />
    </WorkspaceRuntimeProvider>
  );
}

function DemoWorkspace({
  sessionEmail,
  onReset,
}: {
  sessionEmail: string | null;
  onReset: () => void;
}) {
  const [phase, setPhase] = useState<DemoPhase>("chooser");
  const [workspaceSeed, setWorkspaceSeed] = useState<WorkspaceSeed | null>(
    null,
  );

  return (
    <div className="min-h-dvh bg-muted/30 [&_header.sticky]:!top-11 lg:[&_aside.sticky]:!top-11 lg:[&_aside.sticky]:!h-[calc(100dvh-2.75rem)]">
      <DemoBanner onReset={onReset} />

      {phase === "chooser" ? (
        <DemoStartChoice
          onExplore={() => {
            setWorkspaceSeed({
              profile: createExploredDemoProfile(),
              onboarding: createExploredDemoOnboarding(),
            });
            setPhase("workspace");
          }}
          onResume={() => setPhase("resume")}
        />
      ) : null}

      {phase === "resume" ? (
        <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
          <ResumeImportWizard
            baselineProfile={createDemoBaselineProfile()}
            mode="onboarding"
            initialSources={[
              {
                id: DEMO_RESUME_SOURCE_ID,
                displayName: DEMO_RESUME_DISPLAY_NAME,
                text: DEMO_RESUME_TEXT,
              },
            ]}
            onApproved={(profile) => {
              setWorkspaceSeed({
                profile,
                onboarding: advanceOnboarding(
                  initialOnboarding(),
                  "career-goal",
                ),
              });
              setPhase("workspace");
            }}
            onCancel={() => setPhase("chooser")}
          />
        </main>
      ) : null}

      {phase === "workspace" && workspaceSeed ? (
        <MovaWorkspace
          userEmail={sessionEmail}
          persistenceEnabled={false}
          initialProfile={workspaceSeed.profile}
          initialOnboarding={workspaceSeed.onboarding}
          initialSelectedRoleId={DEMO_DEFAULT_CAREER_ROLE_ID}
          showRestoreDemo={false}
          accountVariant="demo"
        />
      ) : null}
    </div>
  );
}

function DemoBanner({ onReset }: { onReset: () => void }) {
  return (
    <div className="sticky top-0 z-30 border-b border-warning/30 bg-warning/12 px-4 py-2">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href={LANDING_PATH}
            className="font-wordmark shrink-0 text-xl text-foreground transition-opacity hover:opacity-80"
          >
            Mova
          </Link>
          <p className="text-sm font-medium text-warning">
            Demo mode — changes aren&apos;t saved.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onReset}>
          Reset demo
        </Button>
      </div>
    </div>
  );
}

function DemoStartChoice({
  onExplore,
  onResume,
}: {
  onExplore: () => void;
  onResume: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6">
      <header className="space-y-2">
        <p className="font-heading text-2xl font-semibold text-foreground">
          Explore Mova
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          This public demo uses one sanitized student story based on a real
          software-engineering resume. Choose how you want to start.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onExplore}
          className="rounded-2xl border bg-card p-5 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <p className="font-semibold text-foreground">
            Explore an existing path
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Open Allyson&apos;s seeded profile, readiness, and recommendations.
          </p>
        </button>

        <button
          type="button"
          onClick={onResume}
          className="rounded-2xl border bg-card p-5 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <p className="font-semibold text-foreground">
            Start from a sample resume
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Analyze the same resume, review what Mova found, then choose a
            career target.
          </p>
        </button>
      </div>
    </main>
  );
}
