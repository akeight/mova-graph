import type { LucideIcon } from
  "lucide-react";

import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  CloudOff,
  LoaderCircle,
} from "lucide-react";

import type {
  WorkspaceSaveStatus,
} from "../types/workspace";

type WorkspaceSaveStatusProps = {
  status: WorkspaceSaveStatus;
  lastSavedAt: Date | null;
  error: string | null;
};

export function WorkspaceSaveStatus({
  status,
  lastSavedAt,
  error,
}: WorkspaceSaveStatusProps) {
  if (status === "loading") {
    return (
      <SaveMessage
        icon={LoaderCircle}
        iconClassName="animate-spin"
        text="Loading saved workspace…"
      />
    );
  }

  if (status === "saving") {
    return (
      <SaveMessage
        icon={Cloud}
        text="Saving changes…"
      />
    );
  }

  if (status === "local-only") {
    return (
      <SaveMessage
        icon={CloudOff}
        className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
        text="Demo mode — changes are not saved"
      />
    );
  }

  if (status === "error") {
    return (
      <SaveMessage
        icon={AlertCircle}
        className="border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
        text={
          error ??
          "Changes could not be saved."
        }
      />
    );
  }

  const savedTime =
    lastSavedAt
      ? lastSavedAt.toLocaleTimeString(
          [],
          {
            hour: "numeric",
            minute: "2-digit",
          },
        )
      : null;

  return (
    <SaveMessage
      icon={CheckCircle2}
      className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
      text={
        savedTime
          ? `Saved at ${savedTime}`
          : "Workspace ready"
      }
    />
  );
}

type SaveMessageProps = {
  icon: LucideIcon;
  text: string;
  className?: string;
  iconClassName?: string;
};

function SaveMessage({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
}: SaveMessageProps) {
  return (
    <div
      className={[
        "inline-flex max-w-full items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground",
        className,
      ].join(" ")}
      role="status"
    >
      <Icon
        className={[
          "h-3.5 w-3.5 shrink-0",
          iconClassName,
        ].join(" ")}
        aria-hidden="true"
      />

      <span className="truncate">
        {text}
      </span>
    </div>
  );
}