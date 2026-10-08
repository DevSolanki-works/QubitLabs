import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
  createTimeoutFetch,
} from "./client";

const MIDDLEWARE_TIMEOUT_MS = 3000;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute =
    pathname.startsWith("/settings") || pathname.startsWith("/profile");
  const isAuthRoute =
    pathname === "/auth/login" ||
    pathname === "/auth/signup" ||
    pathname === "/auth/forgot-password";

  // Fast-path: if the incoming request has no Supabase auth cookies (`sb-*`),
  // skip the external network call to Supabase completely.
  const hasSupabaseCookies = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));

  if (!hasSupabaseCookies) {
    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  let networkFailed = false;

  const supabase = createServerClient(
    DEFAULT_SUPABASE_URL,
    DEFAULT_SUPABASE_ANON_KEY,
    {
      global: {
        fetch: createTimeoutFetch(MIDDLEWARE_TIMEOUT_MS, () => {
          networkFailed = true;
        }),
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Do not clear existing auth cookies if the failure was a transient network timeout
          if (networkFailed) return;
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), MIDDLEWARE_TIMEOUT_MS)
      ),
    ]);
    user = result?.data?.user ?? null;
  } catch {
    user = null;
  }

  // If user is already logged in, redirect away from auth pages (/auth/login, /auth/signup) to /dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // If user is not logged in and attempts to access protected routes, redirect to /auth/login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
