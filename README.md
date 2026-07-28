<<<<<<< HEAD
# Mova

> **Make every move count.**

Mova is an AI-powered student decision platform that connects courses, skills, projects, experiences, and career goals into one interactive map.

Rather than giving students another static checklist, Mova helps them understand where they currently stand, what their target career requires, what evidence they already have, and which next action would create the most meaningful progress.

Mova is being developed for the **Stellic Pathfinders Hackathon**.

## Project Status

**Initial development**

The repository currently contains the technical foundation for the Mova hackathon MVP. Product features, database tables, AI workflows, and graph interactions are actively being developed.

## The Problem

Students make important academic and career decisions across disconnected systems.

A degree planner may know which courses a student needs to graduate. A résumé contains projects, jobs, and extracurricular experiences. Job descriptions introduce another set of expectations, while internships and campus opportunities appear somewhere else entirely.

Students are left to determine how these pieces connect:

* Does this course build skills relevant to my target role?
* Does this project provide meaningful evidence of those skills?
* Which career requirements am I still missing?
* Should I prioritize another course, project, internship, or organization?
* What changes if I choose a different academic or career direction?

Traditional planning systems show students what they must complete.

**Mova shows students where their decisions can lead.**

## The Solution

Mova transforms a student’s academic history, experiences, skills, and goals into a connected career-readiness model.

The platform maps relationships between:

```text
Courses
   ↓ teach
Skills
   ↓ demonstrated through
Experiences
   ↓ supported by
Evidence
   ↓ compared against
Career Requirements
```

Mova identifies missing or weak connections and recommends the student’s highest-impact next move.

## Planned Hackathon MVP

### Student Profile

Students can add or import information about:

* Degree and academic program
* Completed and planned courses
* Projects
* Internships and employment
* Clubs and extracurricular activities
* Technical and professional skills
* Target internships or career roles

### AI-Assisted Skill Extraction

Mova analyzes natural-language descriptions of courses, projects, and experiences and converts them into structured data.

For example:

```text
I built an internship tracker using Next.js and PostgreSQL.
```

Mova may identify evidence for:

```text
TypeScript
React
Next.js
PostgreSQL
Full-stack development
Product development
```

Students will be able to review and correct inferred information before it becomes part of their profile.

### Interactive Opportunity Map

Mova visualizes the student’s academic-to-career journey as an interactive graph containing:

* Courses
* Skills
* Projects
* Experiences
* Evidence
* Career goals
* Target roles
* Recommendations

Graph relationships explain how each item contributes to the student’s trajectory.

### Readiness and Gap Analysis

Mova compares the student’s demonstrated skills and evidence against the requirements of a target role.

The analysis distinguishes between:

* Skills supported by strong evidence
* Skills supported by limited evidence
* Skills currently in progress
* Missing skills
* High-priority gaps

### Next-Move Recommendations

Mova recommends actions based on their expected impact.

Recommendations may include:

* Complete a specific course
* Build a targeted project
* Strengthen an existing project
* Apply for an internship
* Join a relevant student organization
* Document stronger evidence
* Explore an adjacent career role

### Scenario Simulator

Students can test possible decisions before committing to them.

Example scenarios include:

* What happens if I take this course?
* How much would this internship improve my readiness?
* Which project would close the largest skill gap?
* What changes if I target product engineering instead?
* Which option creates the most progress this semester?

Mova updates the graph and explains how the proposed decision changes the student’s trajectory.

## Demo Journey

The intended hackathon demonstration follows one complete student journey:

1. A student creates an academic and career profile.
2. The student selects a target career role.
3. The student enters courses, projects, and experiences.
4. Mova extracts relevant skills and supporting evidence.
5. Mova generates an interactive opportunity map.
6. The platform identifies missing or weak connections.
7. Mova recommends the highest-impact next action.
8. The student tests a possible course, project, or internship.
9. The graph updates to show how that decision changes their readiness.

## Technology Stack

### Application

* TypeScript
* React
* Next.js App Router
* Tailwind CSS
* shadcn/ui
* Bun

### Visualization

* React Flow using `@xyflow/react`
* Custom Mova nodes and edges

### Backend

* Next.js Server Actions
* Next.js Route Handlers
* Zod validation
* Feature-oriented service layer

### Database

* Supabase PostgreSQL
* Drizzle ORM
* Drizzle Kit migrations
* Supabase Auth

### Artificial Intelligence

* Vercel AI SDK
* OpenAI as the initial model provider
* Structured outputs validated with Zod
* Provider abstraction for future model changes

### Deployment

* Vercel
* Supabase

## Architecture

```text
┌─────────────────────────────────────────────┐
│                 Mova Web App                │
│          Next.js, React, TypeScript         │
├─────────────────────────────────────────────┤
│                                             │
│  Onboarding           Opportunity Map       │
│  Student Profile      Gap Analysis          │
│  Career Goals         Recommendations       │
│  Scenario Simulator                         │
│                                             │
├─────────────────────────────────────────────┤
│       Server Actions and Route Handlers     │
├─────────────────────────────────────────────┤
│                                             │
│  Profile Service       Graph Service        │
│  Matching Service      Recommendation       │
│  AI Extraction         Scenario Service     │
│                                             │
├──────────────────────┬──────────────────────┤
│ Supabase PostgreSQL  │ AI Model Provider    │
│ Drizzle ORM          │ Vercel AI SDK        │
└──────────────────────┴──────────────────────┘
```

## Graph Architecture

Mova does not require a dedicated graph database for the hackathon MVP.

Domain information is stored in PostgreSQL using entities such as:

```text
Student
Course
Skill
Experience
Evidence
Career Goal
Role
Recommendation
Scenario
```

Relational tables represent connections such as:

```text
Course       → teaches      → Skill
Experience   → demonstrates → Skill
Evidence     → validates    → Skill
Role         → requires     → Skill
Career Goal  → targets      → Role
```

A graph-building service transforms those records into React Flow data:

```text
PostgreSQL records
        ↓
Graph-building service
        ↓
Nodes and edges
        ↓
Interactive React Flow visualization
```

This provides a graph-based user experience while preserving a straightforward relational data model.

## AI Responsibilities

Mova uses AI for tasks where language interpretation is useful:

* Extracting structured information from student descriptions
* Inferring likely skills from courses and experiences
* Normalizing different names for similar skills
* Interpreting natural-language career goals
* Generating clear explanations
* Converting scenario requests into structured inputs

## Deterministic Responsibilities

Core product decisions remain in application code:

* Calculating skill coverage
* Comparing student evidence with role requirements
* Ranking skill gaps
* Assigning confidence levels
* Building graph nodes and edges
* Ranking recommendations
* Applying scenario changes
* Enforcing authorization and validation

AI assists with interpretation and communication. It does not independently determine a student’s future or silently modify an academic plan.

## Repository Structure

```text
mova/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── api/
│   ├── components/
│   │   └── ui/
│   ├── features/
│   │   ├── onboarding/
│   │   ├── student-profile/
│   │   ├── goals/
│   │   ├── pathway-graph/
│   │   │   ├── components/
│   │   │   ├── nodes/
│   │   │   └── edges/
│   │   ├── skill-analysis/
│   │   ├── recommendations/
│   │   └── scenario-simulator/
│   ├── server/
│   │   ├── services/
│   │   └── repositories/
│   ├── lib/
│   │   ├── ai/
│   │   ├── auth/
│   │   ├── db/
│   │   │   └── schema/
│   │   └── validation/
│   └── types/
├── drizzle/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
├── drizzle.config.ts
├── bun.lock
└── package.json
```

## Getting Started

### Prerequisites

Install or configure the following before running Mova locally:

* Bun
* Git
* A Supabase project
* An OpenAI API key
* GitHub CLI, optional but recommended

Check your Bun installation:

```bash
bun --version
```

Update Bun when needed:

```bash
bun upgrade
```

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd mova
```

Install dependencies:

```bash
bun install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Add the required values to `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

OPENAI_API_KEY=
```

Run the development server:

```bash
bun run dev
```

Open the application at:

```text
http://localhost:3000
```

## Available Scripts

### Development

Start the local development server:

```bash
bun run dev
```

Create a production build:

```bash
bun run build
```

Run the production build locally:

```bash
bun run start
```

### Code Quality

Run ESLint:

```bash
bun run lint
```

Automatically fix supported linting issues:

```bash
bun run lint:fix
```

Run TypeScript type checking:

```bash
bun run typecheck
```

Run linting and type checking together:

```bash
bun run check
```

Run all pre-pull-request validation:

```bash
bun run validate
```

The validation command runs:

```text
lint → typecheck → production build
```

### Database

Generate migration files from schema changes:

```bash
bun run db:generate
```

Apply generated migrations:

```bash
bun run db:migrate
```

Push the current schema directly to the development database:

```bash
bun run db:push
```

Open Drizzle Studio:

```bash
bun run db:studio
```

## Package Scripts

The expected `package.json` scripts are:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "typecheck": "tsc --noEmit",
    "check": "bun run lint && bun run typecheck",
    "validate": "bun run check && bun run build",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

## Environment Variables

Create `.env.local` from `.env.example`.

| Variable                               | Purpose                                     |
| -------------------------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`                  | Public application URL                      |
| `DATABASE_URL`                         | Pooled PostgreSQL application connection    |
| `DIRECT_URL`                           | Direct PostgreSQL connection for migrations |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL                        |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase browser-safe publishable key       |
| `OPENAI_API_KEY`                       | Server-side OpenAI API access               |

Never commit `.env.local` or production secrets.

## Bun Package Management

Mova uses Bun for dependency management and script execution.

Install a production dependency:

```bash
bun add <package-name>
```

Install a development dependency:

```bash
bun add --dev <package-name>
```

Remove a dependency:

```bash
bun remove <package-name>
```

Perform a frozen install in CI:

```bash
bun install --frozen-lockfile
```

The `bun.lock` file must remain committed to the repository.

Do not commit or use:

```text
package-lock.json
yarn.lock
pnpm-lock.yaml
```

## Development Workflow

Create a branch for each feature or fix:

```bash
git checkout -b feature/graph-foundation
```

Before opening a pull request, run:

```bash
bun run validate
```

Use focused commit messages:

```text
feat: add student goal selection
feat: build initial pathway graph
fix: validate AI skill extraction
chore: configure Drizzle migrations
docs: update local setup instructions
```

## Initial Milestones

### Milestone 1: Foundation

* [ ] Initialize the Next.js application
* [ ] Configure shadcn/ui
* [ ] Configure Supabase
* [ ] Configure Drizzle
* [ ] Add authentication
* [ ] Establish shared types and validation

### Milestone 2: Student Model

* [ ] Create the student profile schema
* [ ] Add career-goal selection
* [ ] Add courses and experiences
* [ ] Create skill and evidence relationships

### Milestone 3: Intelligence

* [ ] Add structured AI extraction
* [ ] Build the matching engine
* [ ] Calculate readiness and skill gaps
* [ ] Rank recommended next moves

### Milestone 4: Visualization

* [ ] Create the React Flow foundation
* [ ] Build custom node types
* [ ] Build custom relationship edges
* [ ] Add graph filters and controls
* [ ] Connect graph data to PostgreSQL records

### Milestone 5: Scenario Simulation

* [ ] Add hypothetical decisions
* [ ] Recalculate readiness
* [ ] Display before-and-after changes
* [ ] Generate scenario explanations

### Milestone 6: Demo Readiness

* [ ] Create a polished onboarding flow
* [ ] Seed a compelling student story
* [ ] Add loading and error states
* [ ] Test the complete demo journey
* [ ] Deploy to Vercel
* [ ] Verify the production environment

## Product Principles

Mova should be:

* **Actionable:** Every analysis should lead to a meaningful next move.
* **Transparent:** Students should understand why something was recommended.
* **Evidence-based:** Readiness should rely on demonstrated experience rather than vague labels.
* **Student-controlled:** AI suggestions should be reviewable and editable.
* **Flexible:** Students should be able to explore multiple possible futures.
* **Focused:** The interface should reduce uncertainty rather than create more information overload.

## Contributing

Mova is currently a hackathon project under active development.

Before contributing:

1. Create or select a GitHub issue.
2. Create a focused feature branch.
3. Keep changes within the issue’s scope.
4. Run `bun run validate`.
5. Open a pull request with a clear summary and testing notes.

## License

This project is licensed under the MIT License.
Copyright (c) 2026 Allyson Keightley
=======
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> 12f4dff (feat: inititalize project)
