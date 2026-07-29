import type { CareerRole } from "../types/career-role";

export const careerRoles = [
  {
    id: "product-engineer",
    title: "Product Engineer",
    description:
      "Build polished, user-centered products across design and engineering.",
    requirements: [
      {
        skillId: "typescript",
        skillName: "TypeScript",
        importance: "required",
      },
      {
        skillId: "react",
        skillName: "React",
        importance: "required",
      },
      {
        skillId: "product-thinking",
        skillName: "Product Thinking",
        importance: "required",
      },
      {
        skillId: "design-systems",
        skillName: "Design Systems",
        importance: "preferred",
      },
      {
        skillId: "user-experience",
        skillName: "User Experience",
        importance: "preferred",
      },
    ],
  },
  {
    id: "frontend-engineer",
    title: "Frontend Engineer",
    description:
      "Build accessible, responsive, and maintainable web interfaces.",
    requirements: [
      {
        skillId: "typescript",
        skillName: "TypeScript",
        importance: "required",
      },
      {
        skillId: "react",
        skillName: "React",
        importance: "required",
      },
      {
        skillId: "html-css",
        skillName: "HTML and CSS",
        importance: "required",
      },
      {
        skillId: "accessibility",
        skillName: "Accessibility",
        importance: "required",
      },
      {
        skillId: "testing",
        skillName: "Frontend Testing",
        importance: "preferred",
      },
    ],
  },
  {
    id: "mobile-engineer",
    title: "Mobile Engineer",
    description:
      "Create reliable and intuitive applications for mobile devices.",
    requirements: [
      {
        skillId: "mobile-development",
        skillName: "Mobile Development",
        importance: "required",
      },
      {
        skillId: "software-testing",
        skillName: "Software Testing",
        importance: "required",
      },
      {
        skillId: "api-integration",
        skillName: "API Integration",
        importance: "required",
      },
      {
        skillId: "user-experience",
        skillName: "User Experience",
        importance: "preferred",
      },
      {
        skillId: "performance",
        skillName: "Application Performance",
        importance: "preferred",
      },
    ],
  },
  {
    id: "full-stack-engineer",
    title: "Full-Stack Engineer",
    description:
      "Develop complete applications across frontend, backend, and data systems.",
    requirements: [
      {
        skillId: "typescript",
        skillName: "TypeScript",
        importance: "required",
      },
      {
        skillId: "react",
        skillName: "React",
        importance: "required",
      },
      {
        skillId: "postgresql",
        skillName: "PostgreSQL",
        importance: "required",
      },
      {
        skillId: "api-design",
        skillName: "API Design",
        importance: "required",
      },
      {
        skillId: "deployment",
        skillName: "Deployment",
        importance: "preferred",
      },
    ],
  },
] satisfies CareerRole[];

export const defaultCareerRoleId = "product-engineer";

export function getCareerRole(
  roleId: string,
): CareerRole {
  return (
    careerRoles.find((role) => role.id === roleId) ??
    careerRoles[0]
  );
}