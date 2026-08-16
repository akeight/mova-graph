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
        className="border-warning/30 bg-warning/12 text-warning"
        text="Demo mode — changes are not saved"
      />
    );
  }

  if (status === "error") {
    return (
      <SaveMessage
        icon={AlertCircle}
        className="border-destructive/30 bg-destructive/12 text-destructive"
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
      className="border-success/30 bg-success/12 text-success"
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