import type {
    StudentProfile,
    StudentSkill,
  } from "@/features/student-profile/types/student-profile";
  
import { reconcileProfileSkills } from
  "@/features/student-profile/utils/reconcile-profile-skills";

import type {
  ApprovedProfileItem,
  ExtractedSkill,
} from "../types/profile-item-extraction";

import {
  expandApprovedEvidence,
} from "./normalize-extraction";
  
  export type ProfileItemIdFactory = (
    prefix: string,
  ) => string;
  
  function createId(prefix: string): string {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  
  function mergeApprovedSkills(
    currentSkills: StudentSkill[],
    approvedSkills: ExtractedSkill[],
    status: StudentSkill["status"],
  ): StudentSkill[] {
    const skillMap = new Map(
      currentSkills.map((skill) => [
        skill.id,
        skill,
      ]),
    );
  
    for (const skill of approvedSkills) {
      const existingSkill =
        skillMap.get(skill.id);
  
      skillMap.set(skill.id, {
        id: skill.id,
  
        name:
          existingSkill?.name ??
          skill.name,
  
        status:
          existingSkill?.status ===
            "demonstrated" ||
          status === "demonstrated"
            ? "demonstrated"
            : "developing",

        ...(existingSkill?.selfReported
          ? { selfReported: true as const }
          : {}),
      });
    }
  
    return Array.from(skillMap.values());
  }
  
  function normalizeApprovedSkills(
    skills: ExtractedSkill[],
  ): ExtractedSkill[] {
    return Array.from(
      new Map(
        skills.map((skill) => [
          skill.id,
          skill,
        ]),
      ).values(),
    );
  }
  
  export function applyApprovedProfileItem(
    profile: StudentProfile,
    item: ApprovedProfileItem,
    createItemId:
      ProfileItemIdFactory = createId,
  ): StudentProfile {
    const title = item.title.trim();
  
    if (!title) {
      throw new Error(
        "An approved profile item requires a title.",
      );
    }
  
    const approvedSkills =
      expandApprovedEvidence(
        normalizeApprovedSkills(item.skills),
      );
  
    if (approvedSkills.length === 0) {
      throw new Error(
        "Select at least one skill before adding the profile item.",
      );
    }
  
    const skillIds = approvedSkills.map(
      (skill) => skill.id,
    );
  
    const skillStatus: StudentSkill["status"] =
      item.status === "completed"
        ? "demonstrated"
        : "developing";
  
    const updatedSkills =
      mergeApprovedSkills(
        profile.skills,
        approvedSkills,
        skillStatus,
      );
  
    const description =
      item.description?.trim() ||
      undefined;
  
    if (item.kind === "course") {
      return reconcileProfileSkills({
        ...profile,
  
        courses: [
          ...profile.courses,
          {
            id: createItemId("course"),
            title,
            description,
            status: item.status,
            skillIds,
          },
        ],
  
        skills: updatedSkills,
      });
    }
  
    return reconcileProfileSkills({
      ...profile,
  
      experiences: [
        ...profile.experiences,
        {
          id: createItemId("experience"),
          title,
          description,
          status: item.status,
          skillIds,
        },
      ],
  
      skills: updatedSkills,
    });
  }