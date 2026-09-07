import { supabaseSession } from "@/lib/supabase/session";
import AccessList from "./AccessList";

export const dynamic = "force-dynamic";

export default async function AdminAccess() {
  const supabase = await supabaseSession();
  const { data, error } = await supabase
    .from("admin_emails")
    .select("*")
    .order("created_at");

  if (error) {
    return <p className="formerr">Could not load the allowlist: {error.message}</p>;
  }
  return <AccessList rows={data ?? []} />;
}
