import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export const DEFAULT_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://itxinmcdjdbjeqzxhmck.supabase.co";

export const DEFAULT_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eGlubWNkamRiamVxenhobWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3OTg4MjQsImV4cCI6MjEwNTM3NDgyNH0.43Q0PLhCCftJw2fcpKWRfApr81ox-NkQ0tVqWdQS7_c";

export function isSupabaseConfigured(): boolean {
  return true;
}

/**
 * Creates a fetch wrapper with an explicit AbortSignal.timeout() that returns
 * HTTP 408 on network/abort errors so @supabase/auth-js does not enter its
 * 26-second exponential-backoff retry loop (which triggers on status 0, 502, 503, 504).
 */
export function createTimeoutFetch(
  timeoutMs = 3000,
  onNetworkFailure?: () => void
): typeof fetch {
  return async (input, init) => {
    const timeoutSignal = AbortSignal.timeout(timeoutMs);
    const signal = init?.signal
      ? AbortSignal.any([init.signal, timeoutSignal])
      : timeoutSignal;

    try {
      return await fetch(input, { ...init, signal });
    } catch {
      onNetworkFailure?.();
      return new Response(
        JSON.stringify({
          error: "network_timeout",
          message: `Supabase request timed out or failed (${timeoutMs}ms limit)`,
        }),
        {
          status: 408,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };
}

export function createClient() {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient(
    DEFAULT_SUPABASE_URL,
    DEFAULT_SUPABASE_ANON_KEY,
    {
      global: {
        fetch: createTimeoutFetch(4000),
      },
    }
  );
  return browserClient;
}
