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
  
  const categoryConfig = {
    student: {
      label: "Student",
      icon: GraduationCap,
      className:
        "border-violet-300 bg-violet-50 text-violet-950 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-100",
      iconClassName:
        "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200",
    },
    course: {
      label: "Course",
      icon: BookOpen,
      className:
        "border-blue-300 bg-blue-50 text-blue-950 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
      iconClassName:
        "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
    },
    experience: {
      label: "Experience",
      icon: BriefcaseBusiness,
      className:
        "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100",
      iconClassName:
        "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
    },
    skill: {
      label: "Skill",
      icon: Sparkles,
      className:
        "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100",
      iconClassName:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
    },
    role: {
      label: "Career role",
      icon: Target,
      className:
        "border-rose-300 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100",
      iconClassName:
        "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200",
    },
    recommendation: {
      label: "Next move",
      icon: Lightbulb,
      className:
        "border-cyan-300 bg-cyan-50 text-cyan-950 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-100",
      iconClassName:
        "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-200",
    },
  } satisfies Record<
    MovaNodeCategory,
    {
      label: string;
      icon: typeof GraduationCap;
      className: string;
      iconClassName: string;
    }
  >;
  
  const statusLabels: Record<MovaNodeStatus, string> = {
    complete: "Complete",
    "in-progress": "In progress",
    missing: "Missing",
    recommended: "Recommended",
  };
  
  const statusClasses: Record<MovaNodeStatus, string> = {
    complete:
      "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    "in-progress":
      "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
    missing:
      "border-red-300 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
    recommended:
      "border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
  };
  
  export function MovaNodeCard({
    data,
    selected,
  }: NodeProps<MovaNode>) {
    const config = categoryConfig[data.category];
    const Icon = config.icon;
  
    return (
      <article
        className={cn(
          "w-60 rounded-2xl border-2 p-4 shadow-sm transition",
          config.className,
          selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        )}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="!h-3 !w-3 !border-2 !border-background !bg-foreground"
        />
  
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              config.iconClassName,
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
  
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
              {config.label}
            </p>
  
            <h3 className="mt-1 text-sm font-semibold leading-tight">
              {data.label}
            </h3>
          </div>
        </div>
  
        {data.description ? (
          <p className="mt-3 text-xs leading-relaxed opacity-75">
            {data.description}
          </p>
        ) : null}
  
        {data.status ? (
          <div className="mt-3">
            <span
              className={cn(
                "inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold",
                statusClasses[data.status],
              )}
            >
              {statusLabels[data.status]}
            </span>
          </div>
        ) : null}
  
        <Handle
          type="source"
          position={Position.Right}
          className="!h-3 !w-3 !border-2 !border-background !bg-foreground"
        />
      </article>
    );
  }