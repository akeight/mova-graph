import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  Lightbulb,
  Sparkles,
  Target,
} from "lucide-react";

import {
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";

import { cn } from "@/lib/utils";

import type {
  MovaNode,
  MovaNodeCategory,
  MovaNodeStatus,
} from "../types/graph";

type CategoryConfig = {
  label: string;
  icon: LucideIcon;
  borderClassName: string;
  iconClassName: string;
};

const categoryConfig = {
  student: {
    label: "Student",
    icon: GraduationCap,
    borderClassName: "border-category-student/70",
    iconClassName: "bg-category-student/12 text-category-student",
  },

  course: {
    label: "Course",
    icon: BookOpen,
    borderClassName: "border-category-course/70",
    iconClassName: "bg-category-course/12 text-category-course",
  },

  experience: {
    label: "Experience",
    icon: BriefcaseBusiness,
    borderClassName: "border-category-experience/70",
    iconClassName: "bg-category-experience/12 text-category-experience",
  },

  skill: {
    label: "Skill",
    icon: Sparkles,
    borderClassName: "border-category-skill/70",
    iconClassName: "bg-category-skill/12 text-category-skill",
  },

  competency: {
    label: "Competency",
    icon: Target,
    borderClassName: "border-category-skill/70",
    iconClassName: "bg-category-skill/12 text-category-skill",
  },

  role: {
    label: "Career role",
    icon: Target,
    borderClassName: "border-category-role/70",
    iconClassName: "bg-category-role/12 text-category-role",
  },

  recommendation: {
    label: "Next move",
    icon: Lightbulb,
    borderClassName: "border-category-recommendation/70",
    iconClassName:
      "bg-category-recommendation/12 text-category-recommendation",
  },
} satisfies Record<MovaNodeCategory, CategoryConfig>;

const statusConfig: Record<
  MovaNodeStatus,
  {
    label: string;
    dotClassName: string;
  }
> = {
  complete: {
    label: "Complete",
    dotClassName: "bg-success",
  },

  "in-progress": {
    label: "In progress",
    dotClassName: "bg-warning",
  },

  planned: {
    label: "Planned",
    dotClassName: "bg-info",
  },

  "not-explored": {
    label: "Not explored",
    dotClassName: "bg-info",
  },

  missing: {
    label: "Missing",
    dotClassName: "bg-destructive",
  },

  recommended: {
    label: "Recommended",
    dotClassName: "bg-primary",
  },

  scenario: {
    label: "Scenario",
    dotClassName: "bg-highlight",
  },
};

export function MovaNodeCard({
  data,
  selected,
}: NodeProps<MovaNode>) {
  const category = categoryConfig[data.category];

  const status = data.status
    ? statusConfig[data.status]
    : undefined;

  const Icon = category.icon;

  return (
    <article
      className={cn(
        "relative flex h-[136px] w-64 flex-col rounded-2xl border-2 bg-background p-4 text-foreground shadow-sm transition-shadow",
        category.borderClassName,
        data.source &&
          "cursor-pointer",
        selected &&
          "ring-2 ring-primary/40 ring-offset-2 ring-offset-background",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-background !bg-muted-foreground"
      />

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            category.iconClassName,
          )}
        >
          <Icon
            className="h-5 w-5"
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {category.label}
          </p>

          <h3 className="mt-1 text-sm font-semibold leading-tight">
            {data.label}
          </h3>
        </div>
      </div>

      {data.description ? (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {data.description}
        </p>
      ) : null}

      {status ? (
        <div className="mt-auto flex items-center gap-2 border-t pt-3">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              status.dotClassName,
            )}
          />

          <span className="text-[11px] font-medium text-muted-foreground">
            {status.label}
          </span>
        </div>
      ) : null}

      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-background !bg-muted-foreground"
      />
    </article>
  );
}