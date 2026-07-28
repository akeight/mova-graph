"use client";

import { useCallback } from "react";

import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type NodeTypes,
} from "@xyflow/react";

import { sampleGraph } from "../data/sample-graph";
import { MovaNodeCard } from "../nodes/mova-node";
import type { MovaEdge, MovaNode } from "../types/graph";

const nodeTypes = {
  mova: MovaNodeCard,
} satisfies NodeTypes;

export function MovaGraph() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<MovaNode>(sampleGraph.nodes);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState<MovaEdge>(sampleGraph.edges);

  const handleConnect = useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
          },
          currentEdges,
        ),
      );
    },
    [setEdges],
  );

  const resetGraph = () => {
    setNodes(sampleGraph.nodes);
    setEdges(sampleGraph.edges);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Your opportunity map
          </h2>

          <p className="text-muted-foreground">
            Explore how your courses and experiences connect to your goal.
          </p>
        </div>

        <button
          type="button"
          onClick={resetGraph}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Reset graph
        </button>
      </div>

      <div className="h-[70vh] min-h-[500px] w-full overflow-hidden rounded-2xl border bg-background">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          defaultEdgeOptions={{
            type: "smoothstep",
          }}
          fitView
          fitViewOptions={{
            padding: 0.2,
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
          />

          <Controls />

          <MiniMap
            pannable
            zoomable
          />
        </ReactFlow>
      </div>
    </section>
  );
}