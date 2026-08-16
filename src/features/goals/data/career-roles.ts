import type { CareerRole } from "../types/career-role";

import { getCompetencyDefinition } from "./competencies";

export const careerRoles = [
  {
    id: "product-engineer",
    title: "Product Engineer",
    description:
      "Build polished, user-centered products across design and engineering.",
    modelVersion: 2,
    competencies: [
      { competencyId: "product-judgment", tier: "core" },
      { competencyId: "user-facing-engineering", tier: "core" },
      { competencyId: "end-to-end-ownership", tier: "core" },
      { competencyId: "application-data-and-apis", tier: "common" },
      { competencyId: "software-quality", tier: "common" },
      { competencyId: "ux-design-fluency", tier: "common" },
      { competencyId: "design-systems", tier: "specialized" },
      { competencyId: "application-performance", tier: "specialized" },
    ],
  },
  {
    id: "frontend-engineer",
    title: "Frontend Engineer",
    description:
      "Build accessible, responsive, and maintainable web interfaces.",
    modelVersion: 2,
    competencies: [
      {
        competencyId: "frontend-application-engineering",
        tier: "core",
      },
      {
        competencyId: "web-interface-implementation",
        tier: "core",
      },
      { competencyId: "ux-design-fluency", tier: "core" },
      { competencyId: "accessibility", tier: "common" },
      { competencyId: "software-quality", tier: "common" },
      { competencyId: "api-consumption", tier: "common" },
      { competencyId: "application-performance", tier: "common" },
      { competencyId: "design-systems", tier: "specialized" },
    ],
  },
  {
    id: "mobile-engineer",
    title: "Mobile Engineer",
    description:
      "Create reliable and intuitive applications for mobile devices.",
    modelVersion: 2,
    competencies: [
      {
        competencyId: "mobile-application-development",
        tier: "core",
      },
      { competencyId: "software-quality", tier: "core" },
      { competencyId: "mobile-api-networking", tier: "core" },
      { competencyId: "mobile-ux", tier: "common" },
      { competencyId: "application-performance", tier: "common" },
      {
        competencyId: "ios-development-specialization",
        tier: "specialized",
        specializationGroup: "mobile-platform",
      },
      {
        competencyId: "android-development-specialization",
        tier: "specialized",
        specializationGroup: "mobile-platform",
      },
    ],
  },
  {
    id: "full-stack-engineer",
    title: "Full-Stack Engineer",
    description:
      "Develop complete applications across frontend, backend, and data systems.",
    modelVersion: 2,
    competencies: [
      {
        competencyId: "frontend-application-engineering",
        tier: "core",
      },
      { competencyId: "backend-api-development", tier: "core" },
      { competencyId: "data-database-development", tier: "core" },
      { competencyId: "software-quality", tier: "common" },
      { competencyId: "production-delivery", tier: "common" },
      {
        competencyId: "user-centered-development",
        tier: "common",
      },
      { competencyId: "cloud-platforms", tier: "specialized" },
    ],
  },
] satisfies CareerRole[];

export const defaultCareerRoleId = "product-engineer";

export function getCareerRole(roleId: string): CareerRole {
  return (
    careerRoles.find((role) => role.id === roleId) ?? careerRoles[0]
  );
}

export function resolveRoleCompetencies(role: CareerRole) {
  return role.competencies.map((assignment) => ({
    assignment,
    definition: getCompetencyDefinition(assignment.competencyId),
  }));
}
