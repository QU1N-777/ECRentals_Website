import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieList = { name: string; value: string; options?: CookieOptions }[];

/**
 * Server client bound to the request's auth cookies. Used by the admin layout
 * to decide whether someone is signed in and on the allowlist.
 */
export async function supabaseSession() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list: CookieList) => {
          try {
            list.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            // Called from a Server Component — the middleware refreshes instead.
          }
        },
      },
    }
  );
}

export type AdminCheck = {
  email: string | null;
  isAdmin: boolean;
};

/** Single source of truth for "may this person use /admin". */
export async function checkAdmin(): Promise<AdminCheck> {
  const supabase = await supabaseSession();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { email: null, isAdmin: false };

  // The allowlist is itself admin-only, so a non-admin simply gets no rows.
  const { data } = await supabase
    .from("admin_emails")
    .select("email")
    .ilike("email", user.email)
    .maybeSingle();

  return { email: user.email, isAdmin: Boolean(data) };
}
