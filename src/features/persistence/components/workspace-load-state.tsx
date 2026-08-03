"use client";

import {
  CloudOff,
  LoaderCircle,
  Play,
  RotateCcw,
} from "lucide-react";

export function WorkspaceLoadingState() {
  return (
    <section
      className="flex min-h-[420px] items-center justify-center rounded-2xl border bg-card p-8 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-sm text-center">
        <LoaderCircle
          className="mx-auto h-9 w-9 animate-spin text-violet-600"
          aria-hidden="true"
        />

        <h2 className="mt-4 text-lg font-semibold">
          Loading your Mova workspace
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Restoring your profile, career target,
          and saved opportunity map.
        </p>
      </div>
    </section>
  );
}

type WorkspaceLoadErrorProps = {
  error: string | null;
  onRetry: () => void;
  onContinueLocally: () => void;
};

export function WorkspaceLoadError({
  error,
  onRetry,
  onContinueLocally,
}: WorkspaceLoadErrorProps) {
  return (
    <section
      className="flex min-h-[420px] items-center justify-center rounded-2xl border border-amber-200 bg-amber-50/50 p-8 shadow-sm dark:border-amber-900 dark:bg-amber-950/20"
      role="alert"
    >
      <div className="max-w-md text-center">
        <CloudOff
          className="mx-auto h-10 w-10 text-amber-700 dark:text-amber-300"
          aria-hidden="true"
        />

        <h2 className="mt-4 text-xl font-semibold">
          We couldn&apos;t load your saved workspace
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {error ??
            "Mova could not connect to workspace storage."}
        </p>

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Retry the connection or continue with the
          demo profile. Changes made in demo mode will
          not be saved.
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <RotateCcw
              className="h-4 w-4"
              aria-hidden="true"
            />

            Retry connection
          </button>

          <button
            type="button"
            onClick={
              onContinueLocally
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            <Play
              className="h-4 w-4"
              aria-hidden="true"
            />

            Continue in demo mode
          </button>
        </div>
      </div>
    </section>
  );
}