"use client";

import { FileUp, PenLine } from "lucide-react";

type ResumeStartChoiceProps = {
  onImport: () => void;
  onManual: () => void;
};

export function ResumeStartChoice({
  onImport,
  onManual,
}: ResumeStartChoiceProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        MOVa works best when it understands what you&apos;ve already done.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onImport}
          className="rounded-2xl border bg-card p-5 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <FileUp className="h-5 w-5 text-primary" aria-hidden="true" />
          <p className="mt-3 font-semibold text-foreground">
            Import my resume
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Fastest</p>
        </button>

        <button
          type="button"
          onClick={onManual}
          className="rounded-2xl border bg-card p-5 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <PenLine className="h-5 w-5 text-primary" aria-hidden="true" />
          <p className="mt-3 font-semibold text-foreground">Build manually</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Enter courses, projects and experience yourself
          </p>
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        You can add another resume later from your profile.
      </p>
    </div>
  );
}
