"use client";

import dynamic from "next/dynamic";

const DotGrid = dynamic(
  () => import("./dot-grid").then((module) => module.DotGrid),
  { ssr: false },
);

export function DotGridBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <DotGrid
        activeColor="#b8b8b8"
        baseColor="#e2e2e2"
        dotSize={2}
        gap={13}
        proximity={50}
        shockRadius={40}
      />
    </div>
  );
}
