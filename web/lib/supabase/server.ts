import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

/**
 * Read-only client for Server Components. Uses the publishable key, so RLS
 * applies and only active/published rows come back.
 */
export const supabasePublic = () =>
  createClient(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false },
  });

/**
 * Service-role client. Bypasses RLS — server-side only, never import this
 * into a Client Component. Used for enquiry writes and admin reads of
 * internal fields such as fleet_numbers.
 */
export const supabaseAdmin = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(url, key, { auth: { persistSession: false } });
};
