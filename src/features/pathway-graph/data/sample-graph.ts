import type { MovaGraph } from "../types/graph";

export const sampleGraph: MovaGraph = {
  nodes: [
    {
      id: "student-1",
      type: "mova",
      position: { x: 0, y: 160 },
      data: {
        label: "Allyson",
        category: "student",
        status: "in-progress",
        description: "Software engineering student",
      },
    },
    {
      id: "course-web-development",
      type: "mova",
      position: { x: 320, y: 20 },
      data: {
        label: "Web Development",
        category: "course",
        status: "complete",
        description: "Completed academic coursework",
      },
    },
    {
      id: "experience-catalyst",
      type: "mova",
      position: { x: 320, y: 280 },
      data: {
        label: "Catalyst",
        category: "experience",
        status: "complete",
        description: "Full-stack internship tracking platform",
      },
    },
    {
      id: "skill-typescript",
      type: "mova",
      position: { x: 650, y: 20 },
      data: {
        label: "TypeScript",
        category: "skill",
        status: "complete",
        description: "Supported by coursework and project evidence",
      },
    },
    {
      id: "skill-product-thinking",
      type: "mova",
      position: { x: 650, y: 280 },
      data: {
        label: "Product Thinking",
        category: "skill",
        status: "in-progress",
        description: "Developing through independent product work",
      },
    },
    {
      id: "role-product-engineer",
      type: "mova",
      position: { x: 980, y: 150 },
      data: {
        label: "Product Engineer",
        category: "role",
        status: "recommended",
        description: "Target career role",
      },
    },
  ],

  edges: [
    {
      id: "student-course",
      source: "student-1",
      target: "course-web-development",
      label: "completed",
      data: {
        relationship: "completed",
      },
    },
    {
      id: "student-catalyst",
      source: "student-1",
      target: "experience-catalyst",
      label: "built",
      data: {
        relationship: "completed",
      },
    },
    {
      id: "course-typescript",
      source: "course-web-development",
      target: "skill-typescript",
      label: "teaches",
      data: {
        relationship: "teaches",
      },
    },
    {
      id: "catalyst-typescript",
      source: "experience-catalyst",
      target: "skill-typescript",
      label: "demonstrates",
      data: {
        relationship: "demonstrates",
      },
    },
    {
      id: "catalyst-product-thinking",
      source: "experience-catalyst",
      target: "skill-product-thinking",
      label: "demonstrates",
      data: {
        relationship: "demonstrates",
      },
    },
    {
      id: "typescript-product-engineer",
      source: "skill-typescript",
      target: "role-product-engineer",
      label: "required by",
      data: {
        relationship: "requires",
      },
    },
    {
      id: "product-thinking-product-engineer",
      source: "skill-product-thinking",
      target: "role-product-engineer",
      label: "supports",
      data: {
        relationship: "supports",
      },
    },
  ],
};