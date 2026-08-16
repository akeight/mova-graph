import type { CareerCompetencyDefinition } from "../types/career-role";

function competency(
  definition: CareerCompetencyDefinition,
): CareerCompetencyDefinition {
  return definition;
}

export const careerCompetencies = [
  competency({
    id: "product-judgment",
    name: "Product Judgment",
    description:
      "Decide what to build, why it matters, and how to prioritize user value.",
    evidence: {
      groups: [
        {
          id: "signal",
          skillIds: ["product-thinking"],
        },
      ],
    },
  }),
  competency({
    id: "software-quality",
    name: "Software Quality",
    description:
      "Verify that software behaves correctly through testing and quality practice.",
    evidence: {
      groups: [
        {
          id: "testing",
          skillIds: ["software-testing", "testing"],
        },
      ],
    },
  }),
  competency({
    id: "ux-design-fluency",
    name: "UX / Design Fluency",
    description:
      "Understand user experience and design systems well enough to build thoughtful interfaces.",
    evidence: {
      groups: [
        {
          id: "fluency",
          skillIds: ["user-experience", "design-systems"],
        },
      ],
    },
  }),
  competency({
    id: "design-systems",
    name: "Design Systems",
    description:
      "Use shared interface patterns and components to keep products consistent.",
    evidence: {
      groups: [
        {
          id: "systems",
          skillIds: ["design-systems"],
        },
      ],
    },
  }),
  competency({
    id: "production-delivery",
    name: "Production Delivery",
    description:
      "Ship software into a running environment so users can rely on it.",
    evidence: {
      groups: [
        {
          id: "delivery",
          skillIds: ["deployment"],
        },
      ],
    },
  }),
  competency({
    id: "application-performance",
    name: "Performance",
    description:
      "Make software fast and reliable enough for real-world use.",
    evidence: {
      groups: [
        {
          id: "performance",
          skillIds: ["performance"],
        },
      ],
    },
  }),
  competency({
    id: "accessibility",
    name: "Accessibility",
    description:
      "Build interfaces that people with disabilities can use.",
    evidence: {
      groups: [
        {
          id: "a11y",
          skillIds: ["accessibility"],
        },
      ],
    },
  }),
  competency({
    id: "user-centered-development",
    name: "Product / User-Centered Development",
    description:
      "Keep product and user needs visible throughout the development process.",
    evidence: {
      groups: [
        {
          id: "user",
          skillIds: ["product-thinking", "user-experience"],
        },
      ],
    },
  }),
  competency({
    id: "cloud-platforms",
    name: "Cloud Platforms",
    description:
      "Use a cloud provider to run or operate software.",
    evidence: {
      groups: [
        {
          id: "cloud",
          skillIds: ["aws"],
        },
      ],
    },
  }),
  competency({
    id: "user-facing-engineering",
    name: "User-Facing Engineering",
    description:
      "Build software people use by combining implementation with user-centered judgment.",
    evidence: {
      groups: [
        {
          id: "implementation",
          skillIds: [
            "frontend-development",
            "react",
            "html-css",
            "mobile-development",
          ],
        },
        {
          id: "user-signal",
          skillIds: [
            "user-experience",
            "accessibility",
            "design-systems",
            "product-thinking",
          ],
        },
      ],
      minimumGroups: 2,
    },
  }),
  competency({
    id: "end-to-end-ownership",
    name: "End-to-End Ownership / Delivery",
    description:
      "Take work from implementation through production delivery.",
    evidence: {
      groups: [
        {
          id: "implementation",
          skillIds: [
            "frontend-development",
            "react",
            "backend-development",
            "api-integration",
            "api-development",
            "mobile-development",
          ],
        },
        {
          id: "delivery",
          skillIds: ["deployment"],
        },
      ],
      minimumGroups: 2,
    },
  }),
  competency({
    id: "application-data-and-apis",
    name: "Application Data & APIs",
    description:
      "Work with application data and integrate APIs as complementary dimensions of connected software.",
    evidence: {
      groups: [
        {
          id: "data",
          skillIds: ["database-development", "postgresql"],
        },
        {
          id: "api",
          skillIds: [
            "api-design",
            "api-integration",
            "api-development",
          ],
        },
      ],
      minimumGroups: 2,
    },
  }),
  competency({
    id: "frontend-application-engineering",
    name: "Frontend Application Engineering",
    description:
      "Build interactive frontend applications, not only static pages.",
    evidence: {
      groups: [
        {
          id: "application",
          skillIds: ["frontend-development", "react"],
        },
      ],
    },
  }),
  competency({
    id: "web-interface-implementation",
    name: "Web Interface Implementation",
    description:
      "Implement web page structure, layout, and styling.",
    evidence: {
      groups: [
        {
          id: "markup",
          skillIds: ["html-css"],
        },
      ],
    },
  }),
  competency({
    id: "api-consumption",
    name: "API Integration",
    description:
      "Connect user-facing software to backend APIs.",
    evidence: {
      groups: [
        {
          id: "api",
          skillIds: ["api-integration"],
        },
      ],
    },
  }),
  competency({
    id: "backend-api-development",
    name: "Backend / API Development",
    description:
      "Design or implement server-side APIs and backend behavior.",
    evidence: {
      groups: [
        {
          id: "backend",
          skillIds: ["backend-development", "api-development"],
        },
      ],
    },
  }),
  competency({
    id: "data-database-development",
    name: "Data / Database Development",
    description:
      "Model and work with application data stores.",
    evidence: {
      groups: [
        {
          id: "data",
          skillIds: ["database-development", "postgresql"],
        },
      ],
    },
  }),
  competency({
    id: "mobile-application-development",
    name: "Mobile Application Development",
    description:
      "Build applications for mobile devices.",
    evidence: {
      groups: [
        {
          id: "platform",
          skillIds: [
            "mobile-development",
            "swift",
            "kotlin",
            "ios-development",
            "android-development",
          ],
        },
      ],
    },
  }),
  competency({
    id: "mobile-api-networking",
    name: "API / Networking Integration",
    description:
      "Connect mobile clients to networked APIs.",
    evidence: {
      groups: [
        {
          id: "networking",
          skillIds: ["api-integration"],
        },
      ],
    },
  }),
  competency({
    id: "mobile-ux",
    name: "Mobile UX",
    description:
      "Design or implement mobile-appropriate user experiences.",
    evidence: {
      groups: [
        {
          id: "ux",
          skillIds: ["user-experience"],
        },
      ],
    },
  }),
  competency({
    id: "ios-development-specialization",
    name: "iOS Development",
    description:
      "Build for Apple platforms with iOS or Swift expertise.",
    evidence: {
      groups: [
        {
          id: "ios",
          skillIds: ["swift", "ios-development"],
        },
      ],
    },
  }),
  competency({
    id: "android-development-specialization",
    name: "Android Development",
    description:
      "Build for Android with Kotlin or Android-platform expertise.",
    evidence: {
      groups: [
        {
          id: "android",
          skillIds: ["kotlin", "android-development"],
        },
      ],
    },
  }),
] satisfies CareerCompetencyDefinition[];

const competencyById = new Map(
  careerCompetencies.map((definition) => [
    definition.id,
    definition,
  ]),
);

export function getCompetencyDefinition(
  competencyId: string,
): CareerCompetencyDefinition {
  const definition = competencyById.get(competencyId);

  if (!definition) {
    throw new Error(
      `Unknown career competency "${competencyId}".`,
    );
  }

  return definition;
}
