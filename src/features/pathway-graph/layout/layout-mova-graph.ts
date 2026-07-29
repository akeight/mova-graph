import dagre from "@dagrejs/dagre";
import { Position } from "@xyflow/react";

import type { MovaGraph } from "../types/graph";

const NODE_WIDTH = 256;
const NODE_HEIGHT = 136;

type LayoutOptions = {
  horizontalSpacing?: number;
  verticalSpacing?: number;
};

export function layoutMovaGraph(
  graph: MovaGraph,
  {
    horizontalSpacing = 260,
    verticalSpacing = 120,
  }: LayoutOptions = {},
): MovaGraph {
  const dagreGraph = new dagre.graphlib.Graph();

  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: "LR",
    ranksep: horizontalSpacing,
    nodesep: verticalSpacing,
    marginx: 80,
    marginy: 80,
  });

  for (const node of graph.nodes) {
    dagreGraph.setNode(node.id, {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });
  }

  for (const edge of graph.edges) {
    dagreGraph.setEdge(edge.source, edge.target);
  }

  dagre.layout(dagreGraph);

  const layoutedNodes = graph.nodes.map((node) => {
    const layoutedPosition = dagreGraph.node(node.id);

    if (!layoutedPosition) {
      return node;
    }

    return {
      ...node,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      position: {
        x: layoutedPosition.x - NODE_WIDTH / 2,
        y: layoutedPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  console.table(
    layoutedNodes.map((node) => ({
      id: node.id,
      x: node.position.x,
      y: node.position.y,
    })),
  );

  return {
    nodes: layoutedNodes,
    edges: graph.edges,
  };
}