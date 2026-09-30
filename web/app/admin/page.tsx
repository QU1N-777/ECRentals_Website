import { getFirebaseAdmin } from "@/lib/firebase/server";
import ContentEditor from "./ContentEditor";
import LeadInsightsWidget from "@/components/admin/LeadInsightsWidget";
import type { SiteContent } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminContent() {
  try {
    const { db } = getFirebaseAdmin();
    const [snapshot, enqSnap, eqSnap] = await Promise.all([
      db.collection("site_content").get(),
      db.collection("enquiries").limit(50).get(),
      db.collection("equipment").get(),
    ]);
      
    const data = snapshot.docs
      .map((doc: any) => ({ key: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => (a.group_name || "").localeCompare(b.group_name || "") || (a.sort_order || 0) - (b.sort_order || 0)) as SiteContent[];

    const enquiries = enqSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    const equipment = eqSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    const availableCount = equipment.filter((e: any) => (e.availability_status || "available") === "available").length;

    return (
      <>
        <LeadInsightsWidget
          enquiries={enquiries}
          lines={[]}
          equipmentCount={equipment.length}
          availableCount={availableCount}
        />
        <ContentEditor rows={data} />
      </>
    );
  } catch (error: any) {
    return <p className="formerr">Could not load content: {error.message}</p>;
  }
}
