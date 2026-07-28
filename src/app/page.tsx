import { MovaGraph } from "@/features/pathway-graph/components/mova-graph";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-muted/30 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Mova
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Make every move count.
          </h1>

          <p className="max-w-2xl text-muted-foreground">
            See how your education, experiences, and skills connect to the
            career you want.
          </p>
        </header>

        <MovaGraph />
      </div>
    </main>
  );
}
