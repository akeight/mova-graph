import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DEMO_PATH, LOGIN_PATH, WORKSPACE_PATH } from "@/lib/app-routes";

export function LandingPage({ signedIn }: { signedIn: boolean }) {
  return (
    <main className="flex min-h-dvh flex-col bg-muted/30">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-4">
          <p className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Mova turns the work you&apos;re already doing into a clear path
            toward the career you want.
          </p>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            See how your courses and experiences connect to a target role, where
            the gaps are, and which next move would create the most progress.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={DEMO_PATH}>Explore demo</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={signedIn ? WORKSPACE_PATH : LOGIN_PATH}>
              {signedIn ? "Open workspace" : "Sign in"}
            </Link>
          </Button>
        </div>

        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Built for the Stellic Pathfinders Challenge
        </p>

        <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
          <Image
            src="/hero-image.png"
            alt="Mova career map connecting courses, skills, and a target role"
            width={1600}
            height={900}
            className="h-auto w-full"
            priority
          />
        </div>
      </div>
    </main>
  );
}
