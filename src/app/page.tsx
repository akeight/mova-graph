import { MovaWorkspace } from "@/features/pathway-graph/components/mova-workspace";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px] space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Mova
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Make every move count.
          </h1>

          <p className="max-w-2xl text-muted-foreground">
            Add your courses and experiences to see how they connect
            to the career you want.
          </p>
        </header>

        <MovaWorkspace />
      </div>
    </main>
  );
}