"use client";

import { Button } from "@/components/ui/button";

type ResumeMissingCheckpointProps = {
  onAddSomething: () => void;
  onLooksRight: () => void;
};

export function ResumeMissingCheckpoint({
  onAddSomething,
  onLooksRight,
}: ResumeMissingCheckpointProps) {
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">
          Anything important missing?
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Resumes are short. Add projects, courses, jobs, volunteer work,
          certifications, or other experience that shows what you&apos;ve
          actually done.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onAddSomething}>
          Add something
        </Button>
        <Button onClick={onLooksRight}>My profile looks right</Button>
      </div>
    </div>
  );
}
