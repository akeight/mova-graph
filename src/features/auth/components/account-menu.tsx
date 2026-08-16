"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AccountMenuProps = {
  userEmail: string | null;
};

/**
 * Compact, visually-secondary account control for the workspace shell.
 * Shows the signed-in email and a sign-out action.
 */
export function AccountMenu({ userEmail }: AccountMenuProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();

      router.replace("/login");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Account
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {userEmail ?? "Signed in"}
        </p>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
        {isSigningOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
