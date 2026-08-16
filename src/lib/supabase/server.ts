import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

import { getSupabaseConfig } from "./config";

/**
 * Creates a Supabase client bound to the current request's cookies.
 *
 * Use this inside Server Components, Route Handlers, and Server Actions. The
 * cookie `setAll` may throw when called from a Server Component (cookies are
 * read-only there); that is expected and safe because session refresh happens
 * in `proxy.ts`.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseConfig();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component. Safe to ignore because the proxy
          // refreshes the session cookies on every request.
        }
      },
    },
  });
}
