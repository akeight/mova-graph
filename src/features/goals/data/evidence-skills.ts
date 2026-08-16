import type { EvidenceSkillDefinition } from "../types/evidence-skill";

export const evidenceSkills = [
  {
    id: "typescript",
    name: "TypeScript",
    category: "technology",
  },
  {
    id: "react",
    name: "React",
    category: "technology",
  },
  {
    id: "html-css",
    name: "HTML and CSS",
    category: "technology",
    aliases: ["html css", "html and css"],
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "technology",
    aliases: ["postgres"],
  },
  {
    id: "swift",
    name: "Swift",
    category: "technology",
  },
  {
    id: "kotlin",
    name: "Kotlin",
    category: "technology",
  },
  {
    id: "aws",
    name: "AWS",
    category: "technology",
    aliases: ["amazon web services"],
  },
  {
    id: "frontend-development",
    name: "Frontend Development",
    category: "capability",
    aliases: [
      "frontend development",
      "front-end development",
      "front end development",
    ],
  },
  {
    id: "backend-development",
    name: "Backend Development",
    category: "capability",
    aliases: [
      "backend development",
      "back-end development",
      "back end development",
    ],
  },
  {
    id: "database-development",
    name: "Database Development",
    category: "capability",
    aliases: ["database development"],
  },
  {
    id: "ios-development",
    name: "iOS Development",
    category: "capability",
    aliases: ["ios", "ios development"],
  },
  {
    id: "android-development",
    name: "Android Development",
    category: "capability",
    aliases: ["android", "android development"],
  },
  {
    id: "api-development",
    name: "API Development",
    category: "capability",
    aliases: ["api development"],
  },
  {
    id: "mobile-development",
    name: "Mobile Development",
    category: "capability",
    aliases: ["mobile app development"],
  },
  {
    id: "product-thinking",
    name: "Product Thinking",
    category: "capability",
    aliases: ["product strategy"],
  },
  {
    id: "software-testing",
    name: "Software Testing",
    category: "capability",
  },
  {
    id: "testing",
    name: "Frontend Testing",
    category: "capability",
  },
  {
    id: "api-design",
    name: "API Design",
    category: "capability",
    aliases: ["rest api design"],
  },
  {
    id: "api-integration",
    name: "API Integration",
    category: "capability",
    aliases: ["api integrations"],
  },
  {
    id: "user-experience",
    name: "User Experience",
    category: "capability",
    aliases: ["ux", "ux design", "user experience design"],
  },
  {
    id: "design-systems",
    name: "Design Systems",
    category: "capability",
  },
  {
    id: "accessibility",
    name: "Accessibility",
    category: "capability",
  },
  {
    id: "performance",
    name: "Application Performance",
    category: "capability",
    aliases: ["performance optimization"],
  },
  {
    id: "deployment",
    name: "Deployment",
    category: "capability",
  },
] satisfies EvidenceSkillDefinition[];

export type EvidenceSkillId = (typeof evidenceSkills)[number]["id"];

export function createEvidenceLookupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const evidenceSkillById = new Map(
  evidenceSkills.map((skill) => [skill.id, skill]),
);

export function getEvidenceSkill(
  skillId: string,
): EvidenceSkillDefinition | undefined {
  return evidenceSkillById.get(skillId);
}

export function getEvidenceSkillName(skillId: string): string {
  return (
    getEvidenceSkill(skillId)?.name ??
    skillId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

export function collectEvidenceLookupKeys(
  skill: EvidenceSkillDefinition,
): string[] {
  const keys = [
    createEvidenceLookupKey(skill.id),
    createEvidenceLookupKey(skill.name),
    ...(skill.aliases ?? []).map(createEvidenceLookupKey),
  ];

  return [...new Set(keys.filter(Boolean))];
}

export function findEvidenceLookupConflicts(): Array<{
  key: string;
  ids: string[];
}> {
  const idsByKey = new Map<string, string[]>();

  for (const skill of evidenceSkills) {
    for (const key of collectEvidenceLookupKeys(skill)) {
      const ids = idsByKey.get(key) ?? [];
      ids.push(skill.id);
      idsByKey.set(key, ids);
    }
  }

  return Array.from(idsByKey.entries())
    .filter(([, ids]) => new Set(ids).size > 1)
    .map(([key, ids]) => ({
      key,
      ids: [...new Set(ids)],
    }));
}

export function buildEvidenceLookupMap(): Map<
  string,
  EvidenceSkillDefinition
> {
  const conflicts = findEvidenceLookupConflicts();

  if (conflicts.length > 0) {
    const summary = conflicts
      .map(
        (conflict) =>
          `"${conflict.key}" → ${conflict.ids.join(", ")}`,
      )
      .join("; ");

    throw new Error(
      `Evidence registry aliases resolve ambiguously: ${summary}`,
    );
  }

  const lookup = new Map<string, EvidenceSkillDefinition>();

  for (const skill of evidenceSkills) {
    for (const key of collectEvidenceLookupKeys(skill)) {
      lookup.set(key, skill);
    }
  }

  return lookup;
}
