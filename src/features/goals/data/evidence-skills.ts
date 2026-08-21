import type { EvidenceSkillDefinition } from "../types/evidence-skill";

export const evidenceSkills = [
  {
    id: "typescript",
    name: "TypeScript",
    category: "technology",
    description: "Typed JavaScript used to implement application code.",
  },
  {
    id: "csharp",
    name: "C#",
    category: "technology",
    aliases: ["c sharp"],
    description: "Programming language used to build .NET applications.",
  },
  {
    id: "react",
    name: "React",
    category: "technology",
    description: "JavaScript library for building interactive user interfaces.",
    implies: ["frontend-development"],
  },
  {
    id: "html-css",
    name: "HTML and CSS",
    category: "technology",
    aliases: ["html css", "html and css"],
    description: "Markup and styling used to structure and present web pages.",
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "technology",
    aliases: ["postgres"],
    description: "Relational database used to store application data.",
    implies: ["database-development"],
  },
  {
    id: "swift",
    name: "Swift",
    category: "technology",
    description: "Programming language used to implement Apple-platform software.",
  },
  {
    id: "kotlin",
    name: "Kotlin",
    category: "technology",
    description: "Programming language used to implement Android or JVM software.",
  },
  {
    id: "python",
    name: "Python",
    category: "technology",
    description: "Programming language used to write application or data software.",
  },
  {
    id: "aws",
    name: "AWS",
    category: "technology",
    aliases: ["amazon web services"],
    description: "Amazon cloud services used to run or operate software.",
    implies: ["cloud-platform"],
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
    description:
      "Building interactive user-facing web application behavior.",
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
    description:
      "Implementing server-side application behavior and services.",
  },
  {
    id: "database-development",
    name: "Database Development",
    category: "capability",
    aliases: ["database development"],
    description:
      "Designing, querying, or implementing application data storage.",
  },
  {
    id: "ios-development",
    name: "iOS Development",
    category: "capability",
    aliases: ["ios", "ios development"],
    description: "Building software for Apple iOS devices.",
    implies: ["mobile-development"],
  },
  {
    id: "android-development",
    name: "Android Development",
    category: "capability",
    aliases: ["android", "android development"],
    description: "Building software for Android devices.",
    implies: ["mobile-development"],
  },
  {
    id: "api-development",
    name: "API Development",
    category: "capability",
    aliases: ["api development"],
    description:
      "Implementing server-side API endpoints, handlers, or services.",
  },
  {
    id: "mobile-development",
    name: "Mobile Development",
    category: "capability",
    aliases: ["mobile app development"],
    description: "Building software intended for mobile platforms.",
  },
  {
    id: "product-thinking",
    name: "Product Thinking",
    category: "capability",
    aliases: ["product strategy"],
    description:
      "Deciding what to build and why it matters for users.",
  },
  {
    id: "software-testing",
    name: "Software Testing",
    category: "capability",
    description:
      "Verifying that software behaves correctly through testing practice.",
  },
  {
    id: "testing",
    name: "Frontend Testing",
    category: "capability",
    aliases: ["frontend testing"],
    description: "Testing user-facing web application behavior.",
  },
  {
    id: "api-design",
    name: "API Design",
    category: "capability",
    aliases: ["rest api design"],
    description:
      "Designing API contracts, routes, resources, schemas, or interfaces.",
  },
  {
    id: "api-integration",
    name: "API Integration",
    category: "capability",
    aliases: ["api integrations"],
    description:
      "Consuming or connecting software to backend or external APIs.",
  },
  {
    id: "user-experience",
    name: "User Experience",
    category: "capability",
    aliases: ["ux", "ux design", "user experience design"],
    description: "Shaping how people interact with a product.",
  },
  {
    id: "design-systems",
    name: "Design Systems",
    category: "capability",
    description:
      "Using shared interface patterns and components for consistency.",
  },
  {
    id: "accessibility",
    name: "Accessibility",
    category: "capability",
    description: "Building interfaces that people with disabilities can use.",
  },
  {
    id: "performance",
    name: "Application Performance",
    category: "capability",
    aliases: ["performance optimization"],
    description: "Making software fast and reliable enough for real use.",
  },
  {
    id: "deployment",
    name: "Deployment",
    category: "capability",
    description:
      "Shipping software into a running environment users can rely on.",
  },
  {
    id: "nextjs",
    name: "Next.js",
    category: "technology",
    aliases: ["next.js", "next js"],
    description: "React framework for building web applications.",
    implies: ["react"],
  },
  {
    id: "vue",
    name: "Vue",
    category: "technology",
    aliases: ["vue.js", "vuejs"],
    description: "JavaScript framework for building user interfaces.",
    implies: ["frontend-development"],
  },
  {
    id: "angular",
    name: "Angular",
    category: "technology",
    description: "TypeScript framework for building web applications.",
    implies: ["frontend-development"],
  },
  {
    id: "svelte",
    name: "Svelte",
    category: "technology",
    description: "Compiler-based framework for building web interfaces.",
    implies: ["frontend-development"],
  },
  {
    id: "nodejs",
    name: "Node.js",
    category: "technology",
    aliases: ["node.js", "node js"],
    description:
      "JavaScript runtime used for tooling or server-side programs.",
  },
  {
    id: "express",
    name: "Express",
    category: "technology",
    aliases: ["express.js", "expressjs"],
    description: "Node.js framework for building HTTP servers.",
    implies: ["backend-development"],
  },
  {
    id: "fastapi",
    name: "FastAPI",
    category: "technology",
    aliases: ["fast api"],
    description: "Python framework for building HTTP APIs.",
    implies: ["backend-development", "api-development"],
  },
  {
    id: "aspnet",
    name: "ASP.NET",
    category: "technology",
    aliases: ["asp.net"],
    description: "Microsoft framework for building server-side .NET applications.",
    implies: ["backend-development"],
  },
  {
    id: "aspnet-core",
    name: "ASP.NET Core",
    category: "technology",
    aliases: ["asp.net core", "aspnet core", "aspnetcore"],
    description:
      "Cross-platform .NET framework for building server-side applications.",
    implies: ["backend-development"],
  },
  {
    id: "spring-boot",
    name: "Spring Boot",
    category: "technology",
    aliases: ["springboot"],
    description: "Java framework for building server-side applications.",
    implies: ["backend-development"],
  },
  {
    id: "dotnet-maui",
    name: ".NET MAUI",
    category: "technology",
    aliases: [".net maui", "dotnet maui", "net maui"],
    description: "Cross-platform .NET framework for building mobile and desktop apps.",
    implies: ["mobile-development"],
  },
  {
    id: "flutter",
    name: "Flutter",
    category: "technology",
    description: "UI toolkit for building cross-platform mobile applications.",
    implies: ["mobile-development"],
  },
  {
    id: "react-native",
    name: "React Native",
    category: "technology",
    aliases: ["reactnative"],
    description: "Framework for building mobile apps with React.",
    implies: ["mobile-development"],
  },
  {
    id: "swiftui",
    name: "SwiftUI",
    category: "technology",
    aliases: ["swift ui"],
    description: "Declarative UI framework for Apple platforms.",
  },
  {
    id: "jetpack-compose",
    name: "Jetpack Compose",
    category: "technology",
    aliases: ["jetpack compose"],
    description: "Declarative UI toolkit for Android applications.",
    implies: ["android-development"],
  },
  {
    id: "mysql",
    name: "MySQL",
    category: "technology",
    description: "Relational database used to store application data.",
    implies: ["database-development"],
  },
  {
    id: "sql-server",
    name: "SQL Server",
    category: "technology",
    aliases: ["mssql", "microsoft sql server", "sqlserver"],
    description: "Microsoft relational database used to store application data.",
    implies: ["database-development"],
  },
  {
    id: "sqlite",
    name: "SQLite",
    category: "technology",
    description: "Embedded relational database used to store application data.",
    implies: ["database-development"],
  },
  {
    id: "mongodb",
    name: "MongoDB",
    category: "technology",
    aliases: ["mongo"],
    description: "Document database used to store application data.",
    implies: ["database-development"],
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "technology",
    description:
      "Backend platform that can provide auth, APIs, or database services.",
  },
  {
    id: "vitest",
    name: "Vitest",
    category: "technology",
    description: "Vite-native test runner for JavaScript and TypeScript.",
    implies: ["software-testing"],
  },
  {
    id: "jest",
    name: "Jest",
    category: "technology",
    description: "JavaScript testing framework.",
    implies: ["software-testing"],
  },
  {
    id: "xunit",
    name: "xUnit",
    category: "technology",
    aliases: ["x unit"],
    description: ".NET testing framework.",
    implies: ["software-testing"],
  },
  {
    id: "nunit",
    name: "NUnit",
    category: "technology",
    aliases: ["n unit"],
    description: ".NET testing framework.",
    implies: ["software-testing"],
  },
  {
    id: "unit-testing",
    name: "Unit Testing",
    category: "capability",
    aliases: ["unit testing", "unit tests"],
    description: "Testing individual units of software in isolation.",
    implies: ["software-testing"],
  },
  {
    id: "integration-testing",
    name: "Integration Testing",
    category: "capability",
    aliases: ["integration testing", "integration tests"],
    description: "Testing how multiple software components work together.",
    implies: ["software-testing"],
  },
  {
    id: "automated-testing",
    name: "Automated Testing",
    category: "capability",
    aliases: ["automated testing", "test automation"],
    description: "Using automated checks to verify software behavior.",
    implies: ["software-testing"],
  },
  {
    id: "azure",
    name: "Azure",
    category: "technology",
    aliases: ["microsoft azure"],
    description: "Microsoft cloud services used to run or operate software.",
    implies: ["cloud-platform"],
  },
  {
    id: "gcp",
    name: "Google Cloud",
    category: "technology",
    aliases: ["google cloud platform", "google cloud"],
    description: "Google cloud services used to run or operate software.",
    implies: ["cloud-platform"],
  },
  {
    id: "cloud-platform",
    name: "Cloud Platform",
    category: "capability",
    aliases: ["cloud platforms", "cloud provider"],
    description: "Using a cloud provider to run or operate software.",
  },
] satisfies EvidenceSkillDefinition[];

export type EvidenceSkillId = (typeof evidenceSkills)[number]["id"];

export const platformCapabilitiesRequiringGrounding = new Set<string>([
  "ios-development",
  "android-development",
]);

export function createEvidenceLookupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/#/g, " sharp ")
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

export function getEvidenceImplicationTargets(
  skill: EvidenceSkillDefinition,
): string[] {
  return skill.implies ?? [];
}

export function findMissingImplicationTargets(
  skills: EvidenceSkillDefinition[] = evidenceSkills,
): Array<{ id: string; target: string }> {
  const ids = new Set(skills.map((skill) => skill.id));
  const missing: Array<{ id: string; target: string }> = [];

  for (const skill of skills) {
    for (const target of getEvidenceImplicationTargets(skill)) {
      if (!ids.has(target)) {
        missing.push({ id: skill.id, target });
      }
    }
  }

  return missing;
}

export function findSelfImplications(
  skills: EvidenceSkillDefinition[] = evidenceSkills,
): string[] {
  return skills
    .filter((skill) => getEvidenceImplicationTargets(skill).includes(skill.id))
    .map((skill) => skill.id);
}

export function findDuplicateImplications(
  skills: EvidenceSkillDefinition[] = evidenceSkills,
): string[] {
  return skills
    .filter((skill) => {
      const targets = getEvidenceImplicationTargets(skill);
      return new Set(targets).size !== targets.length;
    })
    .map((skill) => skill.id);
}

export function findEvidenceImplicationCycles(
  skills: EvidenceSkillDefinition[] = evidenceSkills,
): string[][] {
  const byId = new Map(skills.map((skill) => [skill.id, skill]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const cycles: string[][] = [];

  const visit = (skillId: string, path: string[]) => {
    if (visiting.has(skillId)) {
      const cycleStart = path.indexOf(skillId);
      cycles.push([...path.slice(cycleStart), skillId]);
      return;
    }

    if (visited.has(skillId)) {
      return;
    }

    visiting.add(skillId);
    const skill = byId.get(skillId);

    for (const target of skill ? getEvidenceImplicationTargets(skill) : []) {
      if (byId.has(target)) {
        visit(target, [...path, skillId]);
      }
    }

    visiting.delete(skillId);
    visited.add(skillId);
  };

  for (const skill of skills) {
    visit(skill.id, []);
  }

  return cycles;
}

export function requiresExplicitSourceGrounding(
  skill: EvidenceSkillDefinition,
): boolean {
  return (
    skill.category === "technology" ||
    platformCapabilitiesRequiringGrounding.has(skill.id)
  );
}
