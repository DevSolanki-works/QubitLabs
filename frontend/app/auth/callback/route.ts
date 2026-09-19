import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from "@/lib/supabase/client";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Determine actual target origin (supporting Vercel forwarded headers)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const effectiveOrigin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : origin;

  if (code) {
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        DEFAULT_SUPABASE_URL,
        DEFAULT_SUPABASE_ANON_KEY,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch {
                // Ignore if called in a server component context
              }
            },
          },
        }
      );

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${effectiveOrigin}${next}`);
      }
      console.warn("Could not exchange OAuth code for session:", error.message);
    } catch (err) {
      console.error("Auth callback exception:", err);
    }
  }

  // Gracefully redirect to dashboard or login without crashing
  return NextResponse.redirect(`${effectiveOrigin}/dashboard`);
}
