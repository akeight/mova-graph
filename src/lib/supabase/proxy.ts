import { NextResponse, type NextRequest } from "next/server";

import { createServerClient } from "@supabase/ssr";

import {
  getPostLoginPath,
  isPublicHtmlPath,
  LOGIN_PATH,
} from "@/lib/app-routes";

import { getSupabaseConfig } from "./config";

/**
 * Refreshes the Supabase auth session on every request and applies optimistic
 * redirects between public pages and the protected workspace.
 *
 * IMPORTANT: This performs an optimistic cookie-based check only. The verified
 * user id is always re-derived from `auth.getUser()` in the data-access layer
 * and API routes before any workspace read or write.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { url, key } = getSupabaseConfig();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({ request });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // API routes enforce their own auth and return JSON 401s. Only refresh the
  // session for them; never redirect an API request to the HTML login page.
  if (pathname.startsWith("/api")) {
    return response;
  }

  const isLoginRoute = pathname === LOGIN_PATH;

  if (!user && !isPublicHtmlPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = LOGIN_PATH;

    return NextResponse.redirect(redirectUrl);
  }

  if (user && isLoginRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getPostLoginPath();

    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
