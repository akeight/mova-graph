"use client";

import { useMemo, useState } from "react";

import { CareerRoleSelector } from
  "@/features/goals/components/career-role-selector";
import {
  careerRoles,
  defaultCareerRoleId,
  getCareerRole,
} from "@/features/goals/data/career-roles";
import { StudentProfileForm } from
  "@/features/student-profile/components/student-profile-form";
import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";

import { sampleStudentProfile } from "../data/sample-student";
import { MovaGraph } from "./mova-graph";

function createDemoProfile(): StudentProfile {
  return structuredClone(sampleStudentProfile);
}

export function MovaWorkspace() {
  const [profile, setProfile] =
    useState<StudentProfile>(createDemoProfile);

  const [selectedRoleId, setSelectedRoleId] =
    useState(defaultCareerRoleId);

  const selectedRole = useMemo(
    () => getCareerRole(selectedRoleId),
    [selectedRoleId],
  );

  const restoreDemo = () => {
    setProfile(createDemoProfile());
    setSelectedRoleId(defaultCareerRoleId);
  };

  return (
    <div className="space-y-6">
      <CareerRoleSelector
        roles={careerRoles}
        selectedRoleId={selectedRoleId}
        onSelect={setSelectedRoleId}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <StudentProfileForm
          profile={profile}
          onChange={setProfile}
          onRestoreDemo={restoreDemo}
        />

        <MovaGraph
          profile={profile}
          role={selectedRole}
        />
      </div>
    </div>
  );
}