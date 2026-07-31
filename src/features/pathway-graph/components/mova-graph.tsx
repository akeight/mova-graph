"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type NodeTypes,
  type ReactFlowInstance,
} from "@xyflow/react";

import type { CareerRole } from "@/features/goals/types/career-role";
import type { StudentProfile } from "@/features/student-profile/types/student-profile";

import { buildStudentGraph } from "../builders/build-student-graph";
import { layoutMovaGraph } from "../layout/layout-mova-graph";
import { MovaNodeCard } from "../nodes/mova-node";
import type { MovaEdge, MovaNode } from "../types/graph";
import type { NextMoveRecommendation } from
  "@/features/recommendations/types/recommendation";

const HORIZONTAL_SPACING = 560;
const VERTICAL_SPACING = 150;

const nodeTypes = {
  mova: MovaNodeCard,
} satisfies NodeTypes;

type MovaGraphProps = {
  profile: StudentProfile;
  role: CareerRole;
  recommendations: NextMoveRecommendation[];
  isScenarioPreview?: boolean;
};

export function MovaGraph({
  profile,
  role,
  recommendations,
  isScenarioPreview = false,
}: MovaGraphProps) {
  const graph = useMemo(() => {
    const studentGraph = buildStudentGraph(profile, role, recommendations);

    return layoutMovaGraph(studentGraph, {
      horizontalSpacing: HORIZONTAL_SPACING,
      verticalSpacing: VERTICAL_SPACING,
    });
  }, [profile, role, recommendations]);

  const structureKey = useMemo(
    () => graph.nodes.map((node) => node.id).sort().join("|"),
    [graph.nodes],
  );

  const [nodes, setNodes, onNodesChange] =
    useNodesState<MovaNode>(graph.nodes);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState<MovaEdge>(graph.edges);

  const reactFlowInstanceRef =
    useRef<ReactFlowInstance<MovaNode, MovaEdge> | null>(null);

  useEffect(() => {
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [graph, setEdges, setNodes]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      void reactFlowInstanceRef.current?.fitView({
        padding: 0.1,
        minZoom: 0.35,
        maxZoom: 0.85,
        duration: 350,
      });
    });
  }, [structureKey]);

  const resetGraphLayout = useCallback(() => {
    setNodes(graph.nodes);
    setEdges(graph.edges);

    window.requestAnimationFrame(() => {
      void reactFlowInstanceRef.current?.fitView({
        padding: 0.1,
        minZoom: 0.35,
        maxZoom: 0.85,
        duration: 400,
      });
    });
  }, [graph, setEdges, setNodes]);

  return (
    <section className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
        <h2 className="text-2xl font-semibold tracking-tight">
  {isScenarioPreview
    ? "Projected opportunity map"
    : "Your opportunity map"}
</h2>

<p className="text-sm text-muted-foreground">
  {isScenarioPreview
    ? `Preview how this move could change your path toward ${role.title}.`
    : `See how your courses and experiences connect to ${role.title}.`}
</p>
        </div>

        <button
          type="button"
          onClick={resetGraphLayout}
          className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Reset layout
        </button>
      </div>

      <div className="h-[75vh] min-h-[650px] w-full overflow-hidden rounded-2xl border bg-background">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={(instance) => {
            reactFlowInstanceRef.current = instance;
          }}
          nodesConnectable={false}
          fitView
          fitViewOptions={{
            padding: 0.1,
            minZoom: 0.35,
            maxZoom: 0.85,
          }}
          minZoom={0.35}
          maxZoom={1.5}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
          />

          <Controls />

          <MiniMap pannable zoomable />
        </ReactFlow>
      </div>
    </section>
  );
}