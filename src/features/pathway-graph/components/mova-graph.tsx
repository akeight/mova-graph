"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Ref,
} from "react";
import { createPortal } from "react-dom";

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
const FOCUS_HEADER_HEIGHT = 56;

const nodeTypes = {
  mova: MovaNodeCard,
} satisfies NodeTypes;

type ViewportSize = {
  width: number;
  height: number;
};

function getLockedViewport(): ViewportSize {
  const viewport = window.visualViewport;

  return {
    width: Math.round(viewport?.width ?? window.innerWidth),
    height: Math.round(viewport?.height ?? window.innerHeight),
  };
}

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
  showMiniMap?: boolean;
  onNodeActivate?: (node: MovaNode) => void;
};

function OpportunityMapCanvas({
  graph,
  resetVersion,
  showMiniMap = false,
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
  const fitFrameRef = useRef<number | null>(null);

  const structureKey = useMemo(
    () =>
      graph.nodes
        .map((node) => node.id)
        .sort()
        .join("|"),
    [graph.nodes],
  );

  const fitGraph = useCallback(() => {
    if (fitFrameRef.current !== null) {
      window.cancelAnimationFrame(fitFrameRef.current);
    }

    fitFrameRef.current = window.requestAnimationFrame(() => {
      fitFrameRef.current = null;
      void reactFlowInstanceRef.current?.fitView({
        padding: 0.1,
        minZoom: 0.35,
        maxZoom: 0.85,
        duration: 0,
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
    if (resetVersion === 0) {
      return;
    }

    setNodes(graph.nodes);
    setEdges(graph.edges);
    fitGraph();
  }, [fitGraph, graph, resetVersion, setEdges, setNodes]);

  useEffect(() => {
    return () => {
      if (fitFrameRef.current !== null) {
        window.cancelAnimationFrame(fitFrameRef.current);
      }
    };
  }, []);

  return (
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
      zoomOnDoubleClick={false}
      minZoom={0.35}
      maxZoom={1.5}
      proOptions={{ hideAttribution: true }}
      style={{ width: "100%", height: "100%" }}
      aria-label="Career opportunity map"
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      <Controls showInteractive={false} />
      {showMiniMap ? (
        <MiniMap pannable zoomable />
      ) : null}
    </ReactFlow>
  );
}

type GraphToolbarProps = {
  title: string;
  description: string;
  titleId: string;
  isFocusMode: boolean;
  onReset: () => void;
  onToggleFocus: () => void;
  exitButtonRef?: Ref<HTMLButtonElement>;
};

function GraphToolbar({
  title,
  description,
  titleId,
  isFocusMode,
  onReset,
  onToggleFocus,
  exitButtonRef,
}: GraphToolbarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        isFocusMode &&
          "h-14 flex-row items-center gap-3 border-b px-4 py-0 sm:px-6",
      )}
    >
      <div className="min-w-0">
        <h2
          id={titleId}
          className={cn(
            "font-semibold tracking-tight",
            isFocusMode ? "truncate text-base" : "text-2xl",
          )}
        >
          {title}
        </h2>

        {isFocusMode ? null : (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size={isFocusMode ? "sm" : "default"}
          onClick={onReset}
        >
          <RotateCcw aria-hidden="true" />
          {isFocusMode ? "Reset" : "Reset layout"}
        </Button>

        {isFocusMode ? (
          <Button
            ref={exitButtonRef}
            type="button"
            size="sm"
            onClick={onToggleFocus}
          >
            <Minimize2 aria-hidden="true" />
            <span className="hidden sm:inline">Exit focus</span>
            <span className="sm:hidden">Exit</span>
          </Button>
        ) : (
          <Button type="button" onClick={onToggleFocus}>
            <Expand aria-hidden="true" />
            Focus mode
          </Button>
        )}
      </div>
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
  const [focusViewport, setFocusViewport] = useState<ViewportSize | null>(
    null,
  );
  const [resetVersion, setResetVersion] = useState(0);
  const [canUseMiniMap, setCanUseMiniMap] = useState(false);
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
    const media = window.matchMedia("(min-width: 768px)");
    const syncMiniMap = () => setCanUseMiniMap(media.matches);

    syncMiniMap();
    media.addEventListener("change", syncMiniMap);

    return () => media.removeEventListener("change", syncMiniMap);
  }, []);

  useEffect(() => {
    if (!isFocusModeOpen) {
      return;
    }

    const html = document.documentElement;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    exitButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFocusModeOpen(false);
        setFocusViewport(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      html.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isFocusModeOpen]);

  const resetGraphLayout = () => {
    setResetVersion((currentVersion) => currentVersion + 1);
  };

  const openFocusMode = () => {
    setFocusViewport(getLockedViewport());
    setIsFocusModeOpen(true);
  };

  const closeFocusMode = () => {
    setIsFocusModeOpen(false);
    setFocusViewport(null);
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
          closeFocusMode();
          window.setTimeout(() => {
            onNodeActivate(action);
          }, 100);
          return;
        }

        onNodeActivate(action);
      }
    : undefined;

  const canvas = (
    <OpportunityMapCanvas
      graph={graph}
      resetVersion={resetVersion}
      showMiniMap={canUseMiniMap && !isFocusModeOpen}
      onNodeActivate={handleNodeActivate}
    />
  );

  return (
    <section className="min-w-0 space-y-4" aria-labelledby="opportunity-map-title">
      <GraphToolbar
        title={title}
        description={description}
        titleId="opportunity-map-title"
        isFocusMode={false}
        onReset={resetGraphLayout}
        onToggleFocus={openFocusMode}
      />

      <div className="h-[500px] w-full overflow-hidden rounded-2xl border bg-background sm:h-[600px] lg:h-[70vh] lg:min-h-[620px]">
        {isFocusModeOpen ? null : canvas}
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground md:hidden">
        Drag to explore the map, pinch to zoom, or open Focus
        mode for a larger view.
      </p>

      {isFocusModeOpen && focusViewport
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="opportunity-map-focus-title"
              className="flex flex-col overflow-hidden bg-background"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 100,
                width: focusViewport.width,
                height: focusViewport.height,
                overscrollBehavior: "none",
              }}
            >
              <GraphToolbar
                title={title}
                description={description}
                titleId="opportunity-map-focus-title"
                isFocusMode
                onReset={resetGraphLayout}
                onToggleFocus={closeFocusMode}
                exitButtonRef={exitButtonRef}
              />

              <div
                className="overflow-hidden bg-background"
                style={{
                  width: focusViewport.width,
                  height: Math.max(
                    200,
                    focusViewport.height - FOCUS_HEADER_HEIGHT,
                  ),
                }}
              >
                {canvas}
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
