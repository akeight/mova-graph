import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LOGIN_PATH, WORKSPACE_PATH } from "@/lib/app-routes";

export function DemoSignInPrompt({
  title,
  description,
  signedIn = false,
}: {
  title: string;
  description: string;
  signedIn?: boolean;
}) {
  return (
    <div className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <Button asChild>
        <Link href={signedIn ? WORKSPACE_PATH : LOGIN_PATH}>
          {signedIn ? "Open workspace" : "Sign in"}
        </Link>
      </Button>
    </div>
  );
}
