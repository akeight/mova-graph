"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

import {
  Expand,
  Minimize2,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { CareerRole } from
  "@/features/goals/types/career-role";

import type { NextMoveRecommendation } from
  "@/features/recommendations/types/recommendation";

import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";

import { buildStudentGraph } from
  "../builders/build-student-graph";
import {
  resolveGraphNodeAction,
  type GraphNodeAction,
} from "../builders/resolve-graph-node-action";

import { layoutMovaGraph } from
  "../layout/layout-mova-graph";

import { MovaNodeCard } from
  "../nodes/mova-node";

import type {
  MovaEdge,
  MovaGraph as MovaGraphData,
  MovaNode,
} from "../types/graph";

const HORIZONTAL_SPACING = 560;
const VERTICAL_SPACING = 150;

const FIT_VIEW_OPTIONS = {
  padding: 0.1,
  minZoom: 0.35,
  maxZoom: 0.85,
  duration: 350,
} as const;

const nodeTypes = {
  mova: MovaNodeCard,
} satisfies NodeTypes;

type MovaGraphProps = {
  profile: StudentProfile;
  role: CareerRole;
  recommendations: NextMoveRecommendation[];
  isScenarioPreview?: boolean;
  onNodeActivate?: (action: GraphNodeAction) => void;
};

type OpportunityMapCanvasProps = {
  graph: MovaGraphData;
  resetVersion: number;
  isFocusMode?: boolean;
  onNodeActivate?: (node: MovaNode) => void;
};

function OpportunityMapCanvas({
  graph,
  resetVersion,
  isFocusMode = false,
  onNodeActivate,
}: OpportunityMapCanvasProps) {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<MovaNode>(graph.nodes);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState<MovaEdge>(graph.edges);

  const reactFlowInstanceRef = useRef<ReactFlowInstance<
    MovaNode,
    MovaEdge
  > | null>(null);

  const structureKey = useMemo(
    () =>
      graph.nodes
        .map((node) => node.id)
        .sort()
        .join("|"),
    [graph.nodes],
  );

  const fitGraph = useCallback((duration = 350) => {
    window.requestAnimationFrame(() => {
      void reactFlowInstanceRef.current?.fitView({
        ...FIT_VIEW_OPTIONS,
        duration,
      });
    });
  }, []);

  useEffect(() => {
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [graph, setEdges, setNodes]);

  useEffect(() => {
    fitGraph();
  }, [fitGraph, structureKey]);

  useEffect(() => {
    fitGraph(250);
  }, [fitGraph, isFocusMode]);

  useEffect(() => {
    if (resetVersion === 0) {
      return;
    }

    setNodes(graph.nodes);
    setEdges(graph.edges);
    fitGraph(400);
  }, [fitGraph, graph, resetVersion, setEdges, setNodes]);

  return (
    <div
      className={
        isFocusMode
          ? "h-full min-h-0 w-full flex-1 overflow-hidden bg-background"
          : "h-[500px] w-full overflow-hidden rounded-2xl border bg-background sm:h-[600px] lg:h-[70vh] lg:min-h-[620px]"
      }
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={
          onNodeActivate
            ? (_event, node) => {
                onNodeActivate(node);
              }
            : undefined
        }
        onInit={(instance) => {
          reactFlowInstanceRef.current = instance;
          fitGraph();
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
        aria-label="Career opportunity map"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
        />

        <Controls />

        <MiniMap pannable zoomable className="hidden md:block" />
      </ReactFlow>
    </div>
  );
}

export function MovaGraph({
  profile,
  role,
  recommendations,
  isScenarioPreview = false,
  onNodeActivate,
}: MovaGraphProps) {
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [resetVersion, setResetVersion] = useState(0);
  const exitButtonRef = useRef<HTMLButtonElement>(null);

  const graph = useMemo(() => {
    const studentGraph = buildStudentGraph(
      profile,
      role,
      recommendations,
    );

    return layoutMovaGraph(studentGraph, {
      horizontalSpacing: HORIZONTAL_SPACING,
      verticalSpacing: VERTICAL_SPACING,
    });
  }, [profile, recommendations, role]);

  useEffect(() => {
    if (!isFocusModeOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    exitButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFocusModeOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isFocusModeOpen]);

  const resetGraphLayout = () => {
    setResetVersion((currentVersion) => currentVersion + 1);
  };

  const title = isScenarioPreview
    ? "Projected opportunity map"
    : "Your opportunity map";

  const description = isScenarioPreview
    ? `Preview how this move could change your path toward ${role.title}.`
    : `See how your courses and experiences connect to ${role.title}.`;

  const handleNodeActivate = onNodeActivate
    ? (node: MovaNode) => {
        const action = resolveGraphNodeAction(node);

        if (action.type === "none") {
          return;
        }

        if (isFocusModeOpen) {
          setIsFocusModeOpen(false);
          window.setTimeout(() => {
            onNodeActivate(action);
          }, 100);
          return;
        }

        onNodeActivate(action);
      }
    : undefined;

  return (
    <section
      className={cn(
        "min-w-0 space-y-4",
        isFocusModeOpen &&
          "fixed inset-0 z-50 flex flex-col space-y-0 bg-background",
      )}
      role={isFocusModeOpen ? "dialog" : undefined}
      aria-modal={isFocusModeOpen ? true : undefined}
      aria-labelledby="opportunity-map-title"
    >
      <div
        className={cn(
          "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
          isFocusModeOpen &&
            "shrink-0 border-b px-4 py-3 sm:items-center sm:px-6",
        )}
      >
        <div className="min-w-0">
          <h2
            id="opportunity-map-title"
            className="text-2xl font-semibold tracking-tight"
          >
            {title}
          </h2>

          <p
            className={cn(
              "mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground",
              isFocusModeOpen && "hidden sm:block",
            )}
          >
            {description}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size={isFocusModeOpen ? "sm" : "default"}
            onClick={resetGraphLayout}
          >
            <RotateCcw aria-hidden="true" />
            {isFocusModeOpen ? "Reset" : "Reset layout"}
          </Button>

          {isFocusModeOpen ? (
            <Button
              ref={exitButtonRef}
              type="button"
              size="sm"
              onClick={() => setIsFocusModeOpen(false)}
            >
              <Minimize2 aria-hidden="true" />
              <span className="hidden sm:inline">Exit focus</span>
              <span className="sm:hidden">Exit</span>
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setIsFocusModeOpen(true)}
            >
              <Expand aria-hidden="true" />
              Focus mode
            </Button>
          )}
        </div>
      </div>

      <OpportunityMapCanvas
        graph={graph}
        resetVersion={resetVersion}
        isFocusMode={isFocusModeOpen}
        onNodeActivate={handleNodeActivate}
      />

      {isFocusModeOpen ? null : (
        <p className="text-xs leading-relaxed text-muted-foreground md:hidden">
          Drag to explore the map, pinch to zoom, or open Focus
          mode for a larger view.
        </p>
      )}
    </section>
  );
}
