# Career Model V2

MOVa scores **weighted competency coverage** from evidence already in a student profile. It answers how prepared someone is for a *type of career*, not whether they match one job posting.

## What the score is

- Core and common competencies are scored from profile evidence.
- Each competency has a credit from 0 to 1 based on evidence groups (demonstrated group = 1, developing = 0.5, missing = 0).
- Overall readiness is:

  `round((average core coverage × 0.60 + average common coverage × 0.40) × 100)`

- Specialized competencies are optional focus areas. They are evaluated and shown, but they do not change the general score.

## What the score is not

- Probability of employment or getting an offer
- A claim that every employer requires the same stack
- Opportunity fit (years of experience, degrees, clearance, citizenship, location, or employer-specific tools)

Those belong to a later Opportunity Fit model.

## Evidence

The evidence registry holds both **concrete technologies** (React, PostgreSQL, Swift) and **broader demonstrated capabilities** (frontend-development, backend-development, ios-development). Either kind of signal can support a competency. One matching skill can satisfy an evidence group; multi-group competencies require the configured number of groups.

## Language

- **Core** — foundational for this career type
- **Common** — frequently valuable across roles
- **Specialized** — varies by company, stack, or focus (unpursued tracks are *not explored*, not red gaps)
