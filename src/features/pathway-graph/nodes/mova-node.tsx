import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  Lightbulb,
  Sparkles,
  Target,
} from "lucide-react";

import { Handle, Position, type NodeProps } from "@xyflow/react";

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
    borderClassName: "border-violet-400",
    iconClassName:
      "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
  course: {
    label: "Course",
    icon: BookOpen,
    borderClassName: "border-blue-400",
    iconClassName:
      "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  experience: {
    label: "Experience",
    icon: BriefcaseBusiness,
    borderClassName: "border-amber-400",
    iconClassName:
      "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  skill: {
    label: "Skill",
    icon: Sparkles,
    borderClassName: "border-emerald-400",
    iconClassName:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  role: {
    label: "Career role",
    icon: Target,
    borderClassName: "border-rose-400",
    iconClassName:
      "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  },
  recommendation: {
    label: "Next move",
    icon: Lightbulb,
    borderClassName: "border-cyan-400",
    iconClassName:
      "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
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
    dotClassName: "bg-emerald-500",
  },
  "in-progress": {
    label: "In progress",
    dotClassName: "bg-amber-500",
  },
  missing: {
    label: "Missing",
    dotClassName: "bg-rose-500",
  },
  recommended: {
    label: "Recommended",
    dotClassName: "bg-blue-500",
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
        "relative w-64 rounded-2xl border-2 bg-background p-4 text-foreground shadow-sm transition-shadow",
        category.borderClassName,
        selected && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background",
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
          <Icon className="h-5 w-5" aria-hidden="true" />
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
        <div className="mt-4 flex items-center gap-2 border-t pt-3">
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