import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";

export const sampleStudentProfile: StudentProfile = {
  id: "allyson",
  name: "Allyson",
  program: "B.S. Software Engineering",

  courses: [
    {
      id: "web-development",
      title: "Web Development",
      description: "Frontend and full-stack application development",
      status: "completed",
      skillIds: [
        "typescript",
        "react",
      ],
    },
    {
      id: "data-structures",
      title: "Data Structures and Algorithms",
      description: "Foundational algorithms and problem solving",
      status: "in-progress",
      skillIds: [
        "problem-solving",
      ],
    },
  ],

  experiences: [
    {
      id: "catalyst",
      title: "Catalyst",
      description: "Full-stack internship tracking platform",
      status: "completed",
      skillIds: [
        "typescript",
        "react",
        "postgresql",
        "product-thinking",
      ],
    },
    {
      id: "itron-internship",
      title: "Itron Software Engineering Internship",
      description: "Mobile development, testing, and feature delivery",
      status: "in-progress",
      skillIds: [
        "software-testing",
        "product-thinking",
      ],
    },
  ],

  skills: [
    {
      id: "typescript",
      name: "TypeScript",
      status: "demonstrated",
    },
    {
      id: "react",
      name: "React",
      status: "demonstrated",
    },
    {
      id: "postgresql",
      name: "PostgreSQL",
      status: "demonstrated",
    },
    {
      id: "product-thinking",
      name: "Product Thinking",
      status: "developing",
    },
    {
      id: "problem-solving",
      name: "Problem Solving",
      status: "developing",
    },
    {
      id: "software-testing",
      name: "Software Testing",
      status: "demonstrated",
    },
  ],
};