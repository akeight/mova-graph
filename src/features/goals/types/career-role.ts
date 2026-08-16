export type CareerCompetencyTier =
  | "core"
  | "common"
  | "specialized";

export type CompetencyEvidenceGroup = {
  id: string;
  skillIds: string[];
};

export type CompetencyEvidenceRule = {
  groups: CompetencyEvidenceGroup[];
  minimumGroups?: number;
};

export type CareerCompetencyDefinition = {
  id: string;
  name: string;
  description: string;
  evidence: CompetencyEvidenceRule;
};

export type RoleCompetency = {
  competencyId: string;
  tier: CareerCompetencyTier;
  specializationGroup?: string;
};

export type CareerRole = {
  id: string;
  title: string;
  description?: string;
  modelVersion: 2;
  competencies: RoleCompetency[];
};
