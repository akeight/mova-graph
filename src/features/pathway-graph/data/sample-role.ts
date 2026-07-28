import type { CareerRole } from
  "@/features/goals/types/career-role";

export const sampleCareerRole: CareerRole = {
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
        skillId: "javascript",
        skillName: "JavaScript",
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
        skillId: "ux-design",
        skillName: "UX Design",
        importance: "preferred",
    },
    {
        skillId: "ui-design",
        skillName: "UI Design",
        importance: "preferred",
    }
  ],
};