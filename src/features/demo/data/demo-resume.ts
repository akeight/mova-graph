import {
  getEvidenceSkill,
  type EvidenceSkillId,
} from "@/features/goals/data/evidence-skills";
import { completeOnboarding, initialOnboarding } from
  "@/features/onboarding/services/onboarding-state";
import type { OnboardingState } from
  "@/features/onboarding/types/onboarding";
import { applyResumeDraftToProfile } from
  "@/features/resume-import/services/apply-resume-draft-to-profile";
import type {
  ResumeDraftItem,
  ResumeImportDraft,
} from "@/features/resume-import/types/resume-import";
import { selectedDirectSkillIds } from
  "@/features/skill-analysis/services/extracted-skill-review";
import { expandApprovedEvidence } from
  "@/features/skill-analysis/services/normalize-extraction";
import type { ExtractedSkill } from
  "@/features/skill-analysis/types/profile-item-extraction";
import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";
import { createEmptyProfile } from
  "@/features/student-profile/utils/create-empty-profile";

export const DEMO_RESUME_SOURCE_ID = "demo-resume-source";
export const DEMO_STUDENT_ID = "demo-student";

export const DEMO_RESUME_TEXT = `ALLYSON KEIGHTLEY
Software Engineering Student

EDUCATION

Western Governors University
Bachelor of Science in Software Engineering
Expected May 2028

Relevant Coursework:
Programming in Python, Data Structures and Algorithms,
Frontend Web Development, Probability & Statistics,
Data Management Foundations, IT Leadership,
User Interface Design, User Experience Design, Version Control


EXPERIENCE

Mobile Application Developer Intern
Itron | April 2026 – Present

Develop and maintain features for an enterprise cross-platform application
for iOS, Android, and Windows using .NET MAUI, C#, and XAML.

Raised unit-test coverage by adding 1,000+ test cases and restoring previously
ignored tests.

Built a REST API log-upload workflow using HTTP POST requests.


Frontend Software Engineer Intern
Todd | January 2026 – April 2026

Shipped 45+ pull requests across React and Next.js applications.

Implemented internationalization and locale-aware routing.

Improved application performance, CI/CD workflows, dependencies, and release
readiness.


Software Engineer Intern
Kahani | September 2025 – January 2026

Led engineering and product planning for a Flutter mobile application for iOS
and Android.

Built a feature-modular MVVM architecture and later translated Figma designs
into a production React site.


PROJECTS

Catalyst — Career Platform
Next.js, TypeScript, PostgreSQL

Built an AI-powered internship tracker with authentication, a Kanban
application pipeline, and personalized interview preparation using external
AI and search APIs.


Leukemia Blood Cell Classifier
Python, React, FastAPI, TensorFlow

Fine-tuned an image classifier reaching 97.8% validation accuracy and built
a React dashboard for metrics and Grad-CAM visualizations.


TECHNICAL SKILLS

AWS, Supabase, Node.js, Express, HTML/CSS
`;

function requireEvidenceSkill(id: EvidenceSkillId) {
  const skill = getEvidenceSkill(id);

  if (!skill) {
    throw new Error(`Demo fixture requires registry evidence "${id}".`);
  }

  return skill;
}

function demoDirectSkill(
  id: EvidenceSkillId,
  sourcePhrase: string,
  evidence: string,
): ExtractedSkill {
  const skill = requireEvidenceSkill(id);

  return {
    id: skill.id,
    name: skill.name,
    sourcePhrase,
    confidence: 1,
    evidence,
    normalizationMethod: "exact-id",
    provenance: "direct",
    category: skill.category,
  };
}

function withItemEvidence(directs: ExtractedSkill[]): {
  skills: ExtractedSkill[];
  selectedSkillIds: string[];
} {
  const skills = expandApprovedEvidence(directs);

  return {
    skills,
    selectedSkillIds: selectedDirectSkillIds(skills),
  };
}

function demoCourse(
  id: string,
  title: string,
  directs: ExtractedSkill[] = [],
): ResumeDraftItem {
  return {
    id,
    kind: "course",
    title,
    status: "in-progress",
    sourceIds: [DEMO_RESUME_SOURCE_ID],
    ...withItemEvidence(directs),
  };
}

function demoExperience(
  item: Omit<ResumeDraftItem, "skills" | "selectedSkillIds" | "sourceIds">,
  directs: ExtractedSkill[],
): ResumeDraftItem {
  return {
    ...item,
    sourceIds: [DEMO_RESUME_SOURCE_ID],
    ...withItemEvidence(directs),
  };
}

export const DEMO_RESUME_DRAFT: ResumeImportDraft = {
  sources: [
    {
      id: DEMO_RESUME_SOURCE_ID,
      displayName: "Sample Software Engineering Resume",
    },
  ],
  proposedName: "Allyson Keightley",
  program: "Bachelor of Science in Software Engineering",
  institution: "Western Governors University",
  applyProposedName: true,
  possibleDuplicates: [],
  standaloneSkills: [
    demoDirectSkill("aws", "AWS", "Technical skills: AWS"),
    demoDirectSkill("supabase", "Supabase", "Technical skills: Supabase"),
    demoDirectSkill("nodejs", "Node.js", "Technical skills: Node.js"),
    demoDirectSkill("express", "Express", "Technical skills: Express"),
    demoDirectSkill("html-css", "HTML/CSS", "Technical skills: HTML/CSS"),
  ],
  selectedStandaloneSkillIds: [
    "aws",
    "supabase",
    "nodejs",
    "express",
    "html-css",
  ],
  items: [
    demoCourse("demo-course-python", "Programming in Python", [
      demoDirectSkill(
        "python",
        "Programming in Python",
        "Relevant coursework includes Programming in Python",
      ),
    ]),
    demoCourse("demo-course-dsa", "Data Structures and Algorithms"),
    demoCourse("demo-course-frontend", "Frontend Web Development", [
      demoDirectSkill(
        "frontend-development",
        "Frontend Web Development",
        "Relevant coursework includes Frontend Web Development",
      ),
    ]),
    demoCourse("demo-course-statistics", "Probability & Statistics"),
    demoCourse("demo-course-data", "Data Management Foundations"),
    demoCourse("demo-course-leadership", "IT Leadership"),
    demoCourse("demo-course-ui", "User Interface Design"),
    demoCourse("demo-course-ux", "User Experience Design", [
      demoDirectSkill(
        "user-experience",
        "User Experience Design",
        "Relevant coursework includes User Experience Design",
      ),
    ]),
    demoCourse("demo-course-version-control", "Version Control"),
    demoExperience(
      {
        id: "demo-work-itron",
        kind: "work",
        title: "Mobile Application Developer Intern",
        organization: "Itron",
        startDate: "2026-04",
        status: "in-progress",
        description:
          "Develop and maintain features for an enterprise cross-platform application for iOS, Android, and Windows using .NET MAUI, C#, and XAML. Raised unit-test coverage by adding 1,000+ tests and restoring ignored tests. Built a REST API log-upload workflow using HTTP POST.",
      },
      [
        demoDirectSkill(
          "dotnet-maui",
          ".NET MAUI",
          "Enterprise cross-platform application using .NET MAUI, C#, and XAML",
        ),
        demoDirectSkill(
          "csharp",
          "C#",
          "Enterprise cross-platform application using .NET MAUI, C#, and XAML",
        ),
        demoDirectSkill(
          "ios-development",
          "iOS",
          "Cross-platform application for iOS, Android, and Windows",
        ),
        demoDirectSkill(
          "android-development",
          "Android",
          "Cross-platform application for iOS, Android, and Windows",
        ),
        demoDirectSkill(
          "unit-testing",
          "unit-test coverage",
          "Raised unit-test coverage by adding 1,000+ test cases",
        ),
        demoDirectSkill(
          "api-integration",
          "HTTP POST",
          "Built a REST API log-upload workflow using HTTP POST requests",
        ),
      ],
    ),
    demoExperience(
      {
        id: "demo-work-todd",
        kind: "work",
        title: "Frontend Software Engineer Intern",
        organization: "Todd",
        startDate: "2026-01",
        endDate: "2026-04",
        status: "completed",
        description:
          "Shipped 45+ pull requests across React and Next.js applications. Implemented internationalization and locale-aware routing. Improved application performance, CI/CD workflows, dependencies, and release readiness.",
      },
      [
        demoDirectSkill(
          "react",
          "React",
          "Shipped 45+ pull requests across React and Next.js applications",
        ),
        demoDirectSkill(
          "nextjs",
          "Next.js",
          "Shipped 45+ pull requests across React and Next.js applications",
        ),
        demoDirectSkill(
          "performance",
          "application performance",
          "Improved application performance, CI/CD workflows, dependencies, and release readiness",
        ),
      ],
    ),
    demoExperience(
      {
        id: "demo-work-kahani",
        kind: "work",
        title: "Software Engineer Intern",
        organization: "Kahani",
        startDate: "2025-09",
        endDate: "2026-01",
        status: "completed",
        description:
          "Led engineering and product planning for a Flutter mobile application for iOS and Android. Built a feature-modular MVVM architecture and later translated Figma designs into a production React site.",
      },
      [
        demoDirectSkill(
          "flutter",
          "Flutter",
          "Led engineering for a Flutter mobile application for iOS and Android",
        ),
        demoDirectSkill(
          "ios-development",
          "iOS",
          "Flutter mobile application for iOS and Android",
        ),
        demoDirectSkill(
          "android-development",
          "Android",
          "Flutter mobile application for iOS and Android",
        ),
        demoDirectSkill(
          "react",
          "React",
          "Translated Figma designs into a production React site",
        ),
        demoDirectSkill(
          "product-thinking",
          "product planning",
          "Led engineering and product planning for a Flutter mobile application",
        ),
      ],
    ),
    demoExperience(
      {
        id: "demo-project-catalyst",
        kind: "project",
        title: "Catalyst — Career Platform",
        status: "completed",
        description:
          "Built an AI-powered internship tracker with authentication, Kanban application management, and personalized interview preparation using external AI and search APIs.",
      },
      [
        demoDirectSkill(
          "nextjs",
          "Next.js",
          "Catalyst — Career Platform built with Next.js, TypeScript, PostgreSQL",
        ),
        demoDirectSkill(
          "typescript",
          "TypeScript",
          "Catalyst — Career Platform built with Next.js, TypeScript, PostgreSQL",
        ),
        demoDirectSkill(
          "postgresql",
          "PostgreSQL",
          "Catalyst — Career Platform built with Next.js, TypeScript, PostgreSQL",
        ),
        demoDirectSkill(
          "api-integration",
          "search APIs",
          "Personalized interview preparation using external AI and search APIs",
        ),
      ],
    ),
    demoExperience(
      {
        id: "demo-project-classifier",
        kind: "project",
        title: "Leukemia Blood Cell Classifier",
        status: "completed",
        description:
          "Fine-tuned an image classifier reaching 97.8% validation accuracy and built a React dashboard for metrics and Grad-CAM visualizations.",
      },
      [
        demoDirectSkill(
          "python",
          "Python",
          "Leukemia Blood Cell Classifier — Python, React, FastAPI, TensorFlow",
        ),
        demoDirectSkill(
          "react",
          "React",
          "Built a React dashboard for metrics and Grad-CAM visualizations",
        ),
        demoDirectSkill(
          "fastapi",
          "FastAPI",
          "Leukemia Blood Cell Classifier — Python, React, FastAPI, TensorFlow",
        ),
      ],
    ),
  ],
};

export function createDemoBaselineProfile(): StudentProfile {
  return createEmptyProfile({
    id: DEMO_STUDENT_ID,
    name: "Allyson Keightley",
  });
}

export function createExploredDemoProfile(): StudentProfile {
  return applyResumeDraftToProfile(
    createDemoBaselineProfile(),
    DEMO_RESUME_DRAFT,
    "onboarding",
  );
}

export function createExploredDemoOnboarding(): OnboardingState {
  return completeOnboarding(initialOnboarding());
}

export function createResumePathOnboarding(): OnboardingState {
  return initialOnboarding();
}
