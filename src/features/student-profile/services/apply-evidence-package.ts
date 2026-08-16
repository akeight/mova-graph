import type {
  StudentExperience,
  StudentProfile,
} from "../types/student-profile";

export const EVIDENCE_PACKAGE_EXPERIENCE_PREFIX =
  "scenario-experience";

function cloneProfile(profile: StudentProfile): StudentProfile {
  return {
    ...profile,
    courses: profile.courses.map((course) => ({
      ...course,
      skillIds: [...course.skillIds],
    })),
    experiences: profile.experiences.map((experience) => ({
      ...experience,
      skillIds: [...experience.skillIds],
    })),
    skills: profile.skills.map((skill) => ({
      ...skill,
    })),
  };
}

export function createEvidencePackageExperience(options: {
  idSuffix: string;
  title: string;
  description: string;
  skillIds: string[];
}): StudentExperience {
  return {
    id: [EVIDENCE_PACKAGE_EXPERIENCE_PREFIX, options.idSuffix].join(
      "-",
    ),
    title: options.title,
    description: options.description,
    status: "completed",
    skillIds: [...options.skillIds],
  };
}

export function applyEvidencePackageToProfile(
  profile: StudentProfile,
  options: {
    idSuffix: string;
    title: string;
    description: string;
    skillIds: string[];
  },
): StudentProfile {
  const projectedProfile = cloneProfile(profile);
  const scenarioExperience = createEvidencePackageExperience(options);

  return {
    ...projectedProfile,
    experiences: [
      ...projectedProfile.experiences.filter(
        (experience) => experience.id !== scenarioExperience.id,
      ),
      scenarioExperience,
    ],
  };
}
