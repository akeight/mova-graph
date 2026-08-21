import { completeOnboarding, initialOnboarding } from
  "@/features/onboarding/services/onboarding-state";
import type { OnboardingState } from
  "@/features/onboarding/types/onboarding";
import { applyResumeDraftToProfile } from
  "@/features/resume-import/services/apply-resume-draft-to-profile";
import type { ResumeImportDraft } from
  "@/features/resume-import/types/resume-import";
import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";
import { createEmptyProfile } from
  "@/features/student-profile/utils/create-empty-profile";

export const DEMO_RESUME_SOURCE_ID = "demo-resume-source";
export const DEMO_RESUME_DISPLAY_NAME = "Sample Software Engineering Resume";
export const DEMO_STUDENT_ID = "demo-student";
export const DEMO_DEFAULT_CAREER_ROLE_ID = "full-stack-engineer";

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

export const DEMO_RESUME_DRAFT: ResumeImportDraft = {
  "sources": [
    {
      "id": "demo-resume-source",
      "displayName": "Sample Software Engineering Resume"
    }
  ],
  "program": "Bachelor of Science in Software Engineering",
  "institution": "Western Governors University",
  "proposedName": "Allyson Keightley",
  "applyProposedName": false,
  "items": [
    {
      "id": "demo-work-itron",
      "kind": "work",
      "title": "Mobile Application Developer Intern",
      "organization": "Itron",
      "startDate": "2026-04",
      "description": "Develop and maintain features for an enterprise cross-platform application for iOS, Android, and Windows using .NET MAUI, C#, and XAML. Raised unit-test coverage by adding 1,000+ test cases and restoring previously ignored tests. Built a REST API log-upload workflow using HTTP POST requests.",
      "status": "in-progress",
      "skills": [
        {
          "id": "dotnet-maui",
          "name": ".NET MAUI",
          "sourcePhrase": ".NET MAUI",
          "confidence": 0.95,
          "evidence": "Used .NET MAUI to build cross-platform application",
          "normalizationMethod": "exact-name",
          "provenance": "direct",
          "category": "technology"
        },
        {
          "id": "mobile-development",
          "name": "Mobile Development",
          "sourcePhrase": "cross-platform application for iOS, Android, and Windows",
          "confidence": 0.9,
          "evidence": "Developed features for iOS, Android, and Windows platforms",
          "normalizationMethod": "semantic",
          "provenance": "direct",
          "category": "capability"
        },
        {
          "id": "csharp",
          "name": "C#",
          "sourcePhrase": "C#",
          "confidence": 0.95,
          "evidence": "Used C# for application development",
          "normalizationMethod": "exact-name",
          "provenance": "direct",
          "category": "technology"
        },
        {
          "id": "ios-development",
          "name": "iOS Development",
          "sourcePhrase": "cross-platform application for iOS, Android, and Windows",
          "confidence": 0.85,
          "evidence": "Developed features for iOS, Android, and Windows platforms",
          "normalizationMethod": "exact-name",
          "provenance": "direct",
          "category": "capability"
        },
        {
          "id": "android-development",
          "name": "Android Development",
          "sourcePhrase": "cross-platform application for iOS, Android, and Windows",
          "confidence": 0.85,
          "evidence": "Developed features for iOS, Android, and Windows platforms",
          "normalizationMethod": "exact-name",
          "provenance": "direct",
          "category": "capability"
        },
        {
          "id": "unit-testing",
          "name": "Unit Testing",
          "sourcePhrase": "unit-test coverage by adding 1,000+ test cases",
          "confidence": 0.95,
          "evidence": "Added 1,000+ unit test cases",
          "normalizationMethod": "semantic",
          "provenance": "direct",
          "category": "capability"
        },
        {
          "id": "software-testing",
          "name": "Software Testing",
          "sourcePhrase": "unit-test coverage by adding 1,000+ test cases",
          "confidence": 0.9,
          "evidence": "Added 1,000+ unit test cases",
          "normalizationMethod": "semantic",
          "provenance": "direct",
          "category": "capability"
        },
        {
          "id": "api-integration",
          "name": "API Integration",
          "sourcePhrase": "REST API log-upload workflow using HTTP POST requests",
          "confidence": 0.85,
          "evidence": "Built workflow that posts to REST API",
          "normalizationMethod": "semantic",
          "provenance": "direct",
          "category": "capability"
        }
      ],
      "selectedSkillIds": [
        "dotnet-maui",
        "mobile-development",
        "csharp",
        "ios-development",
        "android-development",
        "unit-testing",
        "software-testing",
        "api-integration"
      ],
      "sourceIds": [
        "demo-resume-source"
      ]
    },
    {
      "id": "demo-work-todd",
      "kind": "work",
      "title": "Frontend Software Engineer Intern",
      "organization": "Todd",
      "startDate": "2026-01",
      "endDate": "2026-04",
      "description": "Shipped 45+ pull requests across React and Next.js applications. Implemented internationalization and locale-aware routing. Improved application performance, CI/CD workflows, dependencies, and release readiness.",
      "status": "completed",
      "skills": [
        {
          "id": "react",
          "name": "React",
          "sourcePhrase": "React",
          "confidence": 0.95,
          "evidence": "Shipped pull requests across React applications",
          "normalizationMethod": "exact-name",
          "provenance": "direct",
          "category": "technology"
        },
        {
          "id": "frontend-development",
          "name": "Frontend Development",
          "sourcePhrase": "Frontend Software Engineer",
          "confidence": 0.9,
          "evidence": "Role title indicates frontend development work",
          "normalizationMethod": "semantic",
          "provenance": "direct",
          "category": "capability"
        },
        {
          "id": "nextjs",
          "name": "Next.js",
          "sourcePhrase": "Next.js",
          "confidence": 0.95,
          "evidence": "Shipped pull requests across Next.js applications",
          "normalizationMethod": "exact-name",
          "provenance": "direct",
          "category": "technology"
        },
        {
          "id": "performance",
          "name": "Application Performance",
          "sourcePhrase": "application performance",
          "confidence": 0.8,
          "evidence": "Improved application performance",
          "normalizationMethod": "exact-name",
          "provenance": "direct",
          "category": "capability"
        },
        {
          "id": "deployment",
          "name": "Deployment",
          "sourcePhrase": "release readiness",
          "confidence": 0.7,
          "evidence": "Improved release readiness",
          "normalizationMethod": "semantic",
          "provenance": "direct",
          "category": "capability"
        }
      ],
      "selectedSkillIds": [
        "react",
        "frontend-development",
        "nextjs"
      ],
      "sourceIds": [
        "demo-resume-source"
      ]
    },
    {
      "id": "demo-work-kahani",
      "kind": "work",
      "title": "Software Engineer Intern",
      "organization": "Kahani",
      "startDate": "2025-09",
      "endDate": "2026-01",
      "description": "Led engineering and product planning for a Flutter mobile application for iOS and Android. Built a feature-modular MVVM architecture and later translated Figma designs into a production React site.",
      "status": "completed",
      "skills": [
        {
          "id": "flutter",
          "name": "Flutter",
          "sourcePhrase": "Flutter mobile application",
          "confidence": 0.95,
          "evidence": "Built Flutter mobile application",
          "normalizationMethod": "exact-name",
          "provenance": "direct",
          "category": "technology"
        },
        {
          "id": "mobile-development",
          "name": "Mobile Development",
          "sourcePhrase": "Flutter mobile application",
          "confidence": 0.9,
          "evidence": "Built Flutter mobile application",
          "normalizationMethod": "semantic",
          "provenance": "direct",
          "category": "capability"
        },
        {
          "id": "ios-development",
          "name": "iOS Development",
          "sourcePhrase": "iOS and Android",
          "confidence": 0.85,
          "evidence": "Application targeted iOS and Android platforms",
          "normalizationMethod": "exact-name",
          "provenance": "direct",
          "category": "capability"
        },
        {
          "id": "android-development",
          "name": "Android Development",
          "sourcePhrase": "iOS and Android",
          "confidence": 0.85,
          "evidence": "Application targeted iOS and Android platforms",
          "normalizationMethod": "exact-name",
          "provenance": "direct",
          "category": "capability"
        },
        {
          "id": "product-thinking",
          "name": "Product Thinking",
          "sourcePhrase": "product planning",
          "confidence": 0.8,
          "evidence": "Led product planning",
          "normalizationMethod": "semantic",
          "provenance": "direct",
          "category": "capability"
        },
        {
          "id": "react",
          "name": "React",
          "sourcePhrase": "production React site",
          "confidence": 0.9,
          "evidence": "Translated designs into production React site",
          "normalizationMethod": "exact-name",
          "provenance": "direct",
          "category": "technology"
        },
        {
          "id": "frontend-development",
          "name": "Frontend Development",
          "sourcePhrase": "production React site",
          "confidence": 0.85,
          "evidence": "Translated designs into production React site",
          "normalizationMethod": "semantic",
          "provenance": "direct",
          "category": "capability"
        }
      ],
      "selectedSkillIds": [
        "flutter",
        "mobile-development",
        "ios-development",
        "android-development",
        "react",
        "frontend-development"
      ],
      "sourceIds": [
        "demo-resume-source"
      ]
    },
    {
      "id": "demo-project-catalyst",
      "kind": "project",
      "title": "Catalyst — Career Platform",
      "description": "Built an AI-powered internship tracker with authentication, a Kanban application pipeline, and personalized interview preparation using external AI and search APIs.",
      "status": "in-progress",
      "skills": [
        {
          "id": "nextjs",
          "name": "Next.js",
          "sourcePhrase": "Next.js",
          "confidence": 0.95,
          "evidence": "Project built with Next.js",
          "normalizationMethod": "exact-name",
          "provenance": "direct",
          "category": "technology"
        },
        {
          "id": "react",
          "name": "React",
          "sourcePhrase": "Next.js",
          "confidence": 0.95,
          "evidence": "Project built with Next.js",
          "normalizationMethod": "derived",
          "provenance": "derived",
          "derivedFromSkillId": "nextjs",
          "category": "technology"
        },
        {
          "id": "frontend-development",
          "name": "Frontend Development",
          "sourcePhrase": "Built an AI-powered internship tracker",
          "confidence": 0.8,
          "evidence": "Built a web application",
          "normalizationMethod": "semantic",
          "provenance": "direct",
          "category": "capability"
        },
        {
          "id": "typescript",
          "name": "TypeScript",
          "sourcePhrase": "TypeScript",
          "confidence": 0.95,
          "evidence": "Project built with TypeScript",
          "normalizationMethod": "exact-name",
          "provenance": "direct",
          "category": "technology"
        },
        {
          "id": "postgresql",
          "name": "PostgreSQL",
          "sourcePhrase": "PostgreSQL",
          "confidence": 0.95,
          "evidence": "Project used PostgreSQL",
          "normalizationMethod": "exact-name",
          "provenance": "direct",
          "category": "technology"
        },
        {
          "id": "database-development",
          "name": "Database Development",
          "sourcePhrase": "PostgreSQL",
          "confidence": 0.95,
          "evidence": "Project used PostgreSQL",
          "normalizationMethod": "derived",
          "provenance": "derived",
          "derivedFromSkillId": "postgresql",
          "category": "capability"
        },
        {
          "id": "api-integration",
          "name": "API Integration",
          "sourcePhrase": "external AI and search APIs",
          "confidence": 0.85,
          "evidence": "Used external APIs for AI and search functionality",
          "normalizationMethod": "semantic",
          "provenance": "direct",
          "category": "capability"
        }
      ],
      "selectedSkillIds": [
        "nextjs",
        "typescript",
        "postgresql",
        "api-integration"
      ],
      "sourceIds": [
        "demo-resume-source"
      ]
    },
    {
      "id": "demo-project-classifier",
      "kind": "project",
      "title": "Leukemia Blood Cell Classifier",
      "description": "Fine-tuned an image classifier reaching 97.8% validation accuracy and built a React dashboard for metrics and Grad-CAM visualizations.",
      "status": "in-progress",
      "skills": [
        {
          "id": "python",
          "name": "Python",
          "sourcePhrase": "Python",
          "confidence": 0.95,
          "evidence": "Project built with Python",
          "normalizationMethod": "exact-name",
          "provenance": "direct",
          "category": "technology"
        },
        {
          "id": "react",
          "name": "React",
          "sourcePhrase": "React",
          "confidence": 0.95,
          "evidence": "Built React dashboard",
          "normalizationMethod": "exact-name",
          "provenance": "direct",
          "category": "technology"
        },
        {
          "id": "frontend-development",
          "name": "Frontend Development",
          "sourcePhrase": "React dashboard",
          "confidence": 0.85,
          "evidence": "Built frontend dashboard with React",
          "normalizationMethod": "semantic",
          "provenance": "direct",
          "category": "capability"
        },
        {
          "id": "fastapi",
          "name": "FastAPI",
          "sourcePhrase": "FastAPI",
          "confidence": 0.95,
          "evidence": "Project used FastAPI",
          "normalizationMethod": "exact-name",
          "provenance": "direct",
          "category": "technology"
        },
        {
          "id": "backend-development",
          "name": "Backend Development",
          "sourcePhrase": "FastAPI",
          "confidence": 0.8,
          "evidence": "Used FastAPI for backend",
          "normalizationMethod": "semantic",
          "provenance": "direct",
          "category": "capability"
        },
        {
          "id": "api-development",
          "name": "API Development",
          "sourcePhrase": "FastAPI",
          "confidence": 0.8,
          "evidence": "Used FastAPI for backend",
          "normalizationMethod": "semantic",
          "provenance": "direct",
          "category": "capability"
        }
      ],
      "selectedSkillIds": [
        "python",
        "react",
        "frontend-development",
        "fastapi"
      ],
      "sourceIds": [
        "demo-resume-source"
      ]
    },
    {
      "id": "demo-course-python",
      "kind": "course",
      "title": "Programming in Python",
      "organization": "Western Governors University",
      "status": "in-progress",
      "skills": [
        {
          "id": "python",
          "name": "Python",
          "sourcePhrase": "Programming in Python",
          "confidence": 0.8,
          "evidence": "Course title explicitly names Python",
          "normalizationMethod": "exact-name",
          "provenance": "direct",
          "category": "technology"
        }
      ],
      "selectedSkillIds": [],
      "sourceIds": [
        "demo-resume-source"
      ]
    },
    {
      "id": "demo-course-dsa",
      "kind": "course",
      "title": "Data Structures and Algorithms",
      "organization": "Western Governors University",
      "status": "in-progress",
      "skills": [],
      "selectedSkillIds": [],
      "sourceIds": [
        "demo-resume-source"
      ]
    },
    {
      "id": "demo-course-frontend",
      "kind": "course",
      "title": "Frontend Web Development",
      "organization": "Western Governors University",
      "status": "in-progress",
      "skills": [
        {
          "id": "frontend-development",
          "name": "Frontend Development",
          "sourcePhrase": "Frontend Web Development",
          "confidence": 0.75,
          "evidence": "Course title explicitly names frontend development",
          "normalizationMethod": "semantic",
          "provenance": "direct",
          "category": "capability"
        }
      ],
      "selectedSkillIds": [],
      "sourceIds": [
        "demo-resume-source"
      ]
    },
    {
      "id": "demo-course-statistics",
      "kind": "course",
      "title": "Probability & Statistics",
      "organization": "Western Governors University",
      "status": "in-progress",
      "skills": [],
      "selectedSkillIds": [],
      "sourceIds": [
        "demo-resume-source"
      ]
    },
    {
      "id": "demo-course-data",
      "kind": "course",
      "title": "Data Management Foundations",
      "organization": "Western Governors University",
      "status": "in-progress",
      "skills": [],
      "selectedSkillIds": [],
      "sourceIds": [
        "demo-resume-source"
      ]
    },
    {
      "id": "demo-course-leadership",
      "kind": "course",
      "title": "IT Leadership",
      "organization": "Western Governors University",
      "status": "in-progress",
      "skills": [],
      "selectedSkillIds": [],
      "sourceIds": [
        "demo-resume-source"
      ]
    },
    {
      "id": "demo-course-ui",
      "kind": "course",
      "title": "User Interface Design",
      "organization": "Western Governors University",
      "status": "in-progress",
      "skills": [
        {
          "id": "user-experience",
          "name": "User Experience",
          "sourcePhrase": "User Interface Design",
          "confidence": 0.7,
          "evidence": "Course title relates to user interface design",
          "normalizationMethod": "semantic",
          "provenance": "direct",
          "category": "capability"
        }
      ],
      "selectedSkillIds": [],
      "sourceIds": [
        "demo-resume-source"
      ]
    },
    {
      "id": "demo-course-ux",
      "kind": "course",
      "title": "User Experience Design",
      "organization": "Western Governors University",
      "status": "in-progress",
      "skills": [
        {
          "id": "user-experience",
          "name": "User Experience",
          "sourcePhrase": "User Experience Design",
          "confidence": 0.75,
          "evidence": "Course title explicitly names user experience",
          "normalizationMethod": "alias",
          "provenance": "direct",
          "category": "capability"
        }
      ],
      "selectedSkillIds": [],
      "sourceIds": [
        "demo-resume-source"
      ]
    },
    {
      "id": "demo-course-version-control",
      "kind": "course",
      "title": "Version Control",
      "organization": "Western Governors University",
      "status": "in-progress",
      "skills": [],
      "selectedSkillIds": [],
      "sourceIds": [
        "demo-resume-source"
      ]
    }
  ],
  "standaloneSkills": [
    {
      "id": "aws",
      "name": "AWS",
      "sourcePhrase": "AWS",
      "confidence": 0.85,
      "evidence": "Listed in Technical Skills section",
      "normalizationMethod": "exact-name",
      "provenance": "direct",
      "category": "technology"
    },
    {
      "id": "cloud-platform",
      "name": "Cloud Platform",
      "sourcePhrase": "AWS",
      "confidence": 0.8,
      "evidence": "Listed in Technical Skills section",
      "normalizationMethod": "semantic",
      "provenance": "direct",
      "category": "capability"
    },
    {
      "id": "supabase",
      "name": "Supabase",
      "sourcePhrase": "Supabase",
      "confidence": 0.85,
      "evidence": "Listed in Technical Skills section",
      "normalizationMethod": "exact-name",
      "provenance": "direct",
      "category": "technology"
    },
    {
      "id": "nodejs",
      "name": "Node.js",
      "sourcePhrase": "Node.js",
      "confidence": 0.85,
      "evidence": "Listed in Technical Skills section",
      "normalizationMethod": "exact-name",
      "provenance": "direct",
      "category": "technology"
    },
    {
      "id": "express",
      "name": "Express",
      "sourcePhrase": "Express",
      "confidence": 0.85,
      "evidence": "Listed in Technical Skills section",
      "normalizationMethod": "exact-name",
      "provenance": "direct",
      "category": "technology"
    }
  ],
  "selectedStandaloneSkillIds": [
    "aws",
    "supabase",
    "nodejs",
    "express"
  ],
  "possibleDuplicates": []
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
