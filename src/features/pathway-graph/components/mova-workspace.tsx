"use client";

import { useState } from "react";

import { StudentProfileForm } from "@/features/student-profile/components/student-profile-form";
import type { StudentProfile } from "@/features/student-profile/types/student-profile";

import { sampleCareerRole } from "../data/sample-role";
import { sampleStudentProfile } from "../data/sample-student";
import { MovaGraph } from "./mova-graph";

function createDemoProfile(): StudentProfile {
  return structuredClone(sampleStudentProfile);
}

export function MovaWorkspace() {
  const [profile, setProfile] =
    useState<StudentProfile>(createDemoProfile);

  const restoreDemo = () => {
    setProfile(createDemoProfile());
  };

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <StudentProfileForm
        profile={profile}
        onChange={setProfile}
        onRestoreDemo={restoreDemo}
      />

      <MovaGraph
        profile={profile}
        role={sampleCareerRole}
      />
    </div>
  );
}