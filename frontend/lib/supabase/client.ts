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

export function createClient() {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient(
    DEFAULT_SUPABASE_URL,
    DEFAULT_SUPABASE_ANON_KEY
  );
  return browserClient;
}
