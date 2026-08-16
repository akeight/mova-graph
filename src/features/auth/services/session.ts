import { cache } from "react";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Returns the verified authenticated user for the current request, or `null`.
 *
 * This is the single server-side source of truth for the current user's id.
 * It calls `auth.getUser()`, which validates the session with the Supabase
 * Auth server, so the returned id can be trusted for ownership checks. Never
 * trust a user id supplied by the browser.
 *
 * Memoized per-request with React `cache` to avoid duplicate verification.
 */
export const getAuthenticatedUser = cache(async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

/**
 * Returns the verified authenticated user, redirecting to `/login` if there is
 * no valid session. Use in Server Components / pages that require auth.
 */
export async function requireUser(): Promise<User> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
