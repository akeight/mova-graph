# Evidence Normalization

MOVa uses AI to interpret evidence, not to assign readiness.

Career readiness remains deterministic after evidence is normalized into canonical IDs and the student approves what enters the profile.

## 1. Evidence ingestion

Evidence enters a student profile through:

- AI extraction (“Analyze with Mova”), after human review
- Manual course and experience create/edit
- Skill rename, which is treated as an evidence edit
- Demo/sample profile literals
- Recommendation/scenario packages, which already use canonical Career Model IDs and are not semantically reinterpreted

Untouched legacy profile IDs are not rewritten on hydration.

## 2. Canonical registry

The evidence registry holds two categories:

- **Technology** — concrete tools and platforms (React, PostgreSQL, .NET MAUI)
- **Capability** — broader demonstrated engineering work (Frontend Development, API Integration)

Both can support Career Model V2 competencies. The graph keeps specific technologies; readiness can consume broader capabilities.

## 3. Aliases

Aliases are true equivalent labels only:

- Postgres = PostgreSQL
- front-end development = Frontend Development

They are not implications. Next.js is not an alias of React.

## 4. Implications

Implications are safe deterministic evidence relationships, expanded recursively without cycles:

- Next.js → React → Frontend Development
- MySQL → Database Development
- Express → Backend Development (not API Development)

Approving a parent includes its implications. Derived evidence is not an independent user choice.

## 5. Semantic AI mapping

One structured model call receives a closed MOVa catalog. The model proposes catalog IDs with per-mapping evidence confidence.

Server-side validation:

1. `sourcePhrase` must appear in the student source
2. Technology and platform IDs are accepted only if their canonical name or safe alias appears in the source
3. Broad capability IDs may be added from context
4. Fake catalog IDs are dropped
5. Empty mappings preserve unknown evidence
6. Deterministic implications expand accepted direct evidence
7. Direct evidence wins over derived evidence when IDs collide

Scanning source text never independently creates technology evidence. A name appearing in text is mention, not demonstrated work, unless the model proposes it and grounding succeeds.

## 6. Unknown evidence

Unknown tools such as AtlasFlow are preserved as profile skills. They do not satisfy Career Model competencies until a catalog mapping exists.

## 7. Human approval

AI suggestions are reviewed before profile insertion. High evidence confidence may start selected. Low-confidence and unmapped evidence stay visible and unselected. Nothing is stored until the student approves.

## 8. Career Model V2 boundary

After normalized evidence is in the profile, readiness, gaps, recommendations, and What If stay deterministic.

MOVa does not use AI to assign readiness scores, competency tiers, or hiring probability.
