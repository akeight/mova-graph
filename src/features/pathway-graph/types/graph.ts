import type { Edge, Node } from "@xyflow/react";

export type MovaNodeCategory =
  | "student"
  | "course"
  | "experience"
  | "skill"
  | "competency"
  | "role"
  | "recommendation";

export type MovaNodeStatus =
  | "complete"
  | "in-progress"
  | "planned"
  | "not-explored"
  | "missing"
  | "recommended"
  | "scenario";

export type MovaNodeData = {
  label: string;
  category: MovaNodeCategory;
  status?: MovaNodeStatus;
  description?: string;
};

export type MovaNode = Node<MovaNodeData, "mova">;

export type MovaRelationship =
  | "completed"
  | "pursuing"
  | "plans"
  | "created"
  | "teaches"
  | "demonstrates"
  | "requires"
  | "supports"
  | "strengthens"
  | "unlocks";

export type MovaEdgeData = {
  relationship: MovaRelationship;
};

export type MovaEdge = Edge<MovaEdgeData>;

export type MovaGraph = {
  nodes: MovaNode[];
  edges: MovaEdge[];
};