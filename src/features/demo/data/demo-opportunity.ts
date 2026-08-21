import {
  getEvidenceSkill,
} from "@/features/goals/data/evidence-skills";
import { expandApprovedEvidence } from
  "@/features/skill-analysis/services/normalize-extraction";
import type { ExtractedSkill } from
  "@/features/skill-analysis/types/profile-item-extraction";
import type { OpportunityExtraction } from
  "@/features/opportunity-what-if/types/opportunity-what-if";

export const DEMO_OPPORTUNITY_TYPE = "internship" as const;

export const DEMO_OPPORTUNITY_TEXT = `Product Engineering Internship — Production Delivery
Join a product team shipping software into a customer-facing environment. You will own production releases, deployment and release pipelines, and monitoring so each build can be relied on after it ships.
`;

function demoOpportunitySkill(
  id: "deployment",
  sourcePhrase: string,
  evidence: string,
): ExtractedSkill {
  const skill = getEvidenceSkill(id);

  if (!skill) {
    throw new Error(`Demo opportunity fixture requires registry evidence "${id}".`);
  }

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

export const DEMO_OPPORTUNITY_EXTRACTION: OpportunityExtraction = {
  opportunityType: DEMO_OPPORTUNITY_TYPE,
  title: "Product Engineering Internship — Production Delivery",
  description:
    "Ship software into a customer-facing environment by owning production releases, deployment and release pipelines, and monitoring.",
  skills: expandApprovedEvidence([
    demoOpportunitySkill(
      "deployment",
      "production releases",
      "Own production releases, deployment and release pipelines, and monitoring so each build can be relied on after it ships",
    ),
  ]),
};
