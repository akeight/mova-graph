type SupabaseConfig = {
  url: string;
  key: string;
};

/**
 * Reads the public Supabase project URL and publishable key from the
 * environment. These are safe to expose to the browser (they are the
 * anon/publishable credentials), but must still be present for auth to work.
 */
export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { url, key };
}
