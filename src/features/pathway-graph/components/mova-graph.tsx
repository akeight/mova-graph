"use client";

import { useCallback } from "react";
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
} from "@xyflow/react";

import { sampleGraph } from "../data/sample-graph";
import type { MovaEdge, MovaNode } from "../types/graph";

export function MovaGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState<MovaNode>(
    sampleGraph.nodes,
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState<MovaEdge>(
    sampleGraph.edges,
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) => addEdge(connection, currentEdges));
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
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </section>
  );
}