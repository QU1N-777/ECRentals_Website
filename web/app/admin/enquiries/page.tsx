import { getFirebaseAdmin } from "@/lib/firebase/server";
import EnquiryInbox from "./EnquiryInbox";

export const dynamic = "force-dynamic";

export default async function AdminEnquiries() {
  try {
    const { db } = getFirebaseAdmin();
    const [snapshot, eqSnap] = await Promise.all([
      db.collection("enquiries").orderBy("submitted_at", "desc").limit(200).get(),
      db.collection("equipment").get(),
    ]);
      
    const enquiries = snapshot.docs.map((doc: any) => {
      const d = doc.data() || {};
      let subAt = d.submitted_at;
      if (subAt?.toDate) subAt = subAt.toDate().toISOString();
      else if (!subAt) subAt = new Date().toISOString();
      return { id: doc.id, ...d, submitted_at: String(subAt) };
    });
    const equipment = eqSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    const availableCount = equipment.filter(
      (e: any) => (e.availability_status || "available") === "available"
    ).length;
    
    const lines = enquiries.flatMap((e) => 
      Array.isArray(e.items) ? e.items.map((item: any) => ({ ...item, enquiry_id: e.id })) : []
    );

    return (
      <EnquiryInbox
        enquiries={enquiries}
        lines={lines}
        equipmentCount={equipment.length}
        availableCount={availableCount}
      />
    );
  } catch (error: any) {
    return <p className="formerr">Could not load enquiries: {error.message}</p>;
  }
}
