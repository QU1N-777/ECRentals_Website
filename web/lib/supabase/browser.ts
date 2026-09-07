"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client for the admin UI. Carries the signed-in admin's session, so
 * every read and write is checked by RLS — including storage uploads. There is
 * no service-role key anywhere in the client bundle.
 */
let cached: ReturnType<typeof createBrowserClient> | null = null;

export function supabaseBrowser() {
  cached ??= createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
  return cached;
}
