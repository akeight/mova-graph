"use client";

import { useCallback, useRef } from "react";

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
  type ReactFlowInstance,
} from "@xyflow/react";

import { buildStudentGraph } from "../builders/build-student-graph";
import { sampleCareerRole } from "../data/sample-role";
import { sampleStudentProfile } from "../data/sample-student";
import { layoutMovaGraph } from "../layout/layout-mova-graph";
import { MovaNodeCard } from "../nodes/mova-node";
import type { MovaEdge, MovaNode } from "../types/graph";

const HORIZONTAL_SPACING = 650;
const VERTICAL_SPACING = 160;

const nodeTypes = {
  mova: MovaNodeCard,
} satisfies NodeTypes;

function createInitialGraph() {
  const graph = buildStudentGraph(
    sampleStudentProfile,
    sampleCareerRole,
  );

  return layoutMovaGraph(graph, {
    horizontalSpacing: HORIZONTAL_SPACING,
    verticalSpacing: VERTICAL_SPACING,
  });
}

export function MovaGraph() {
  const initialGraph = createInitialGraph();

  const [nodes, setNodes, onNodesChange] =
    useNodesState<MovaNode>(initialGraph.nodes);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState<MovaEdge>(initialGraph.edges);

  const reactFlowInstanceRef =
    useRef<ReactFlowInstance<MovaNode, MovaEdge> | null>(null);

  const handleConnect = useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) =>
        addEdge(connection, currentEdges),
      );
    },
    [setEdges],
  );

  const resetGraph = useCallback(() => {
    const graph = createInitialGraph();

    setNodes(graph.nodes);
    setEdges(graph.edges);

    // Wait for React Flow to receive the reset node positions,
    // then move the viewport so the complete graph is visible again.
    window.requestAnimationFrame(() => {
      void reactFlowInstanceRef.current?.fitView({
        padding: 0.12,
        minZoom: 0.2,
        maxZoom: 0.85,
        duration: 400,
      });
    });
  }, [setEdges, setNodes]);

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
          className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Reset graph
        </button>
      </div>

      <div className="h-[75vh] min-h-[650px] w-full overflow-hidden rounded-2xl border bg-background">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onInit={(instance) => {
            reactFlowInstanceRef.current = instance;
          }}
          fitView
          fitViewOptions={{
            padding: 0.12,
            minZoom: 0.2,
            maxZoom: 0.85,
          }}
          minZoom={0.2}
          maxZoom={1.5}
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