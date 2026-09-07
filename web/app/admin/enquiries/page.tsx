import { supabaseSession } from "@/lib/supabase/session";
import EnquiryInbox from "./EnquiryInbox";

export const dynamic = "force-dynamic";

export default async function AdminEnquiries() {
  const supabase = await supabaseSession();
  const { data: enquiries, error } = await supabase
    .from("enquiries")
    .select("*")
    .order("submitted_at", { ascending: false })
    .limit(200);

  if (error) {
    return <p className="formerr">Could not load enquiries: {error.message}</p>;
  }

  const ids = (enquiries ?? []).map((e) => e.id);
  const { data: lines } = ids.length
    ? await supabase.from("enquiry_items").select("*").in("enquiry_id", ids)
    : { data: [] };

  return <EnquiryInbox enquiries={enquiries ?? []} lines={lines ?? []} />;
}
