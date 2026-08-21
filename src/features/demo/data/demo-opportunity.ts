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

export const DEMO_OPPORTUNITY_TEXT = `Production Release Internship — Mobile Delivery
Join the Itron mobile team to take the enterprise .NET MAUI application from internal testing to a customer-facing production release. You will own release pipelines, store submission, and monitoring so each build can be relied on in the field.
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
  title: "Production Release Internship — Mobile Delivery",
  description:
    "Take the enterprise MAUI application from internal testing to a customer-facing production release by owning release pipelines, store submission, and monitoring.",
  skills: expandApprovedEvidence([
    demoOpportunitySkill(
      "deployment",
      "production release",
      "Own release pipelines, store submission, and monitoring so each build can be relied on in the field",
    ),
  ]),
};
