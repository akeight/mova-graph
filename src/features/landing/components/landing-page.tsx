import Image from "next/image";
import Link from "next/link";

import { PublicPageFrame } from "@/components/public-page-frame";
import { Button } from "@/components/ui/button";
import { DEMO_PATH, LOGIN_PATH, WORKSPACE_PATH } from "@/lib/app-routes";

export function LandingPage({ signedIn }: { signedIn: boolean }) {
  return (
    <PublicPageFrame>
      <main className="flex min-h-dvh flex-col">
        <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16 lg:px-8 lg:py-20">
          <div className="flex max-w-xl flex-col gap-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-plum)] font-wordmark text-xl font-bold text-primary-foreground">
                M
              </span>
              <p className="font-wordmark text-3xl text-foreground sm:text-4xl">
                Mova
              </p>
            </div>

            <div className="space-y-5">
              <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Blueprint your path <span className="font-wordmark font-thin">forward</span>.
              </h1>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                Mova turns the work you&apos;re already doing into a clear path
                toward the career you want. See what your experience already
                proves, where the gaps are, and which next moves can get you
                closer.
              </p>
            </div>

            <div className="grid w-fit grid-cols-2 gap-3">
              <Button asChild size="lg" className="w-full">
                <Link href={DEMO_PATH}>Explore demo →</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full">
                <Link href={signedIn ? WORKSPACE_PATH : LOGIN_PATH}>
                  {signedIn ? "Open workspace" : "Sign in"}
                </Link>
              </Button>
            </div>

            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Built for the Stellic Pathfinders Challenge
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
            <Image
              src="/hero-image.png"
              alt="Mova career map connecting courses, skills, and a target role"
              width={1536}
              height={1024}
              className="h-auto w-full"
              priority
            />

            <div className="pointer-events-none absolute -bottom-4 -left-3 w-[42%] max-w-56 motion-safe:animate-float sm:-bottom-8 sm:-left-8 sm:max-w-64">
              <Image
                src="/secondary.png"
                alt=""
                width={1536}
                height={1024}
                className="h-auto w-full drop-shadow-sm"
              />
            </div>

            <div className="pointer-events-none absolute -right-2 top-[8%] w-[32%] max-w-44 motion-safe:animate-float-delayed sm:-right-6 sm:max-w-52">
              <Image
                src="/third.png"
                alt=""
                width={1402}
                height={1122}
                className="h-auto w-full drop-shadow-sm"
              />
            </div>
          </div>
        </div>
      </main>
    </PublicPageFrame>
  );
}
