"use client";

import { ArrowRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { WorkspaceView } from "../types/workspace-view";

type PathContinueNavProps = {
  current: Extract<
    WorkspaceView,
    "career-map" | "skill-gaps" | "next-steps" | "what-if"
  >;
  onNavigate: (view: WorkspaceView) => void;
  onAddEvidence?: () => void;
};

export function PathContinueNav({
  current,
  onNavigate,
  onAddEvidence,
}: PathContinueNavProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {current !== "career-map" && onAddEvidence ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddEvidence}
        >
          <Plus aria-hidden="true" />
          Add evidence
        </Button>
      ) : null}

      {current === "career-map" ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80"
          onClick={() => onNavigate("skill-gaps")}
        >
          Review skill gaps
          <ArrowRight aria-hidden="true" />
        </Button>
      ) : null}

      {current === "skill-gaps" ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80"
          onClick={() => onNavigate("next-steps")}
        >
          See next steps
          <ArrowRight aria-hidden="true" />
        </Button>
      ) : null}

      {current === "next-steps" ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80"
          onClick={() => onNavigate("what-if")}
        >
          Try What If?
          <ArrowRight aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
