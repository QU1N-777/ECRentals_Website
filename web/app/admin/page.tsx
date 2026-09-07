import { supabaseSession } from "@/lib/supabase/session";
import ContentEditor from "./ContentEditor";
import type { SiteContent } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminContent() {
  const supabase = await supabaseSession();
  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .order("group_name")
    .order("sort_order");

  if (error) {
    return <p className="formerr">Could not load content: {error.message}</p>;
  }
  return <ContentEditor rows={(data ?? []) as SiteContent[]} />;
}
