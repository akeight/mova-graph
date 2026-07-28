import type { Edge, Node } from "@xyflow/react";

export type MovaNodeCategory =
  | "student"
  | "course"
  | "experience"
  | "skill"
  | "role"
  | "recommendation";

export type MovaNodeStatus =
  | "complete"
  | "in-progress"
  | "missing"
  | "recommended";

export type MovaNodeData = {
  label: string;
  category: MovaNodeCategory;
  status?: MovaNodeStatus;
  description?: string;
};

export type MovaNode = Node<MovaNodeData>;

export type MovaEdgeData = {
  relationship:
    | "completed"
    | "teaches"
    | "demonstrates"
    | "requires"
    | "supports"
    | "unlocks";
};

export type MovaEdge = Edge<MovaEdgeData>;

export type MovaGraph = {
  nodes: MovaNode[];
  edges: MovaEdge[];
};