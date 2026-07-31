import { careerRoles } from
  "@/features/goals/data/career-roles";

import type {
  ExtractedSkill,
  ProfileItemExtraction,
  ProfileItemKind,
} from "../types/profile-item-extraction";

import type {
  RawProfileItemExtraction,
} from "../schemas/profile-item-extraction";

type CanonicalSkill = {
  id: string;
  name: string;
};

const aliasMap: Record<
  string,
  CanonicalSkill
> = {
  ux: {
    id: "user-experience",
    name: "User Experience",
  },

  "ux design": {
    id: "user-experience",
    name: "User Experience",
  },

  "user experience design": {
    id: "user-experience",
    name: "User Experience",
  },

  "html css": {
    id: "html-css",
    name: "HTML and CSS",
  },

  "html and css": {
    id: "html-css",
    name: "HTML and CSS",
  },

  postgres: {
    id: "postgresql",
    name: "PostgreSQL",
  },

  "product strategy": {
    id: "product-thinking",
    name: "Product Thinking",
  },

  "product development": {
    id: "product-thinking",
    name: "Product Thinking",
  },

  "mobile app development": {
    id: "mobile-development",
    name: "Mobile Development",
  },

  "rest api design": {
    id: "api-design",
    name: "API Design",
  },

  "api development": {
    id: "api-design",
    name: "API Design",
  },

  "api integrations": {
    id: "api-integration",
    name: "API Integration",
  },

  "performance optimization": {
    id: "performance",
    name: "Application Performance",
  },
};

function createLookupKey(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function createSkillId(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function createCareerSkillCatalog():
  Map<string, CanonicalSkill> {
  const catalog = new Map<
    string,
    CanonicalSkill
  >();

  for (const role of careerRoles) {
    for (const requirement of
      role.requirements) {
      const skill = {
        id: requirement.skillId,
        name: requirement.skillName,
      };

      catalog.set(
        createLookupKey(
          requirement.skillName,
        ),
        skill,
      );

      catalog.set(
        createLookupKey(
          requirement.skillId,
        ),
        skill,
      );
    }
  }

  return catalog;
}

const careerSkillCatalog =
  createCareerSkillCatalog();

function resolveCanonicalSkill(
  name: string,
): CanonicalSkill {
  const lookupKey =
    createLookupKey(name);

  const alias = aliasMap[lookupKey];

  if (alias) {
    return alias;
  }

  const careerSkill =
    careerSkillCatalog.get(lookupKey);

  if (careerSkill) {
    return careerSkill;
  }

  return {
    id: createSkillId(name),
    name: name.trim(),
  };
}

function normalizeConfidence(
  confidence: number,
): number {
  return Math.round(confidence * 100) / 100;
}

export function normalizeExtractedSkills(
  rawSkills:
    RawProfileItemExtraction["skills"],
): ExtractedSkill[] {
  const skillsById = new Map<
    string,
    ExtractedSkill
  >();

  for (const rawSkill of rawSkills) {
    const canonical =
      resolveCanonicalSkill(
        rawSkill.name,
      );

    if (!canonical.id) {
      continue;
    }

    const normalizedSkill: ExtractedSkill = {
      id: canonical.id,
      name: canonical.name,
      confidence:
        normalizeConfidence(
          rawSkill.confidence,
        ),
      evidence: rawSkill.evidence.trim(),
    };

    const existingSkill =
      skillsById.get(canonical.id);

    if (
      !existingSkill ||
      normalizedSkill.confidence >
        existingSkill.confidence
    ) {
      skillsById.set(
        canonical.id,
        normalizedSkill,
      );
    }
  }

  return Array.from(
    skillsById.values(),
  ).sort(
    (left, right) =>
      right.confidence -
        left.confidence ||
      left.name.localeCompare(right.name),
  );
}

export function normalizeProfileItemExtraction(
  kind: ProfileItemKind,
  raw: RawProfileItemExtraction,
): ProfileItemExtraction {
  return {
    kind,
    title: raw.title.trim(),
    description:
      raw.description.trim(),
    skills:
      normalizeExtractedSkills(
        raw.skills,
      ),
  };
}