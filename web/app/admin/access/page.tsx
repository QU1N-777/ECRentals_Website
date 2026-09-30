import { getFirebaseAdmin } from "@/lib/firebase/server";
import AccessList from "./AccessList";

export const dynamic = "force-dynamic";

export default async function AdminAccess() {
  try {
    const { db } = getFirebaseAdmin();
    const snapshot = await db.collection("admin_emails").get();
    
    // Ensure all fields (especially Firestore Timestamps or Dates) are plain JSON serializable
    const data = snapshot.docs.map((doc: any) => {
      const d = doc.data() || {};
      let createdAtStr: string | null = null;
      if (typeof d.created_at === "string") {
        createdAtStr = d.created_at;
      } else if (d.created_at?.toDate) {
        createdAtStr = d.created_at.toDate().toISOString();
      } else if (typeof d.addedAt === "string") {
        createdAtStr = d.addedAt;
      } else if (d.addedAt?.toDate) {
        createdAtStr = d.addedAt.toDate().toISOString();
      }

      return {
        email: doc.id,
        full_name: d.full_name || d.name || null,
        role: d.role || "Fleet Admin",
        note: d.note || null,
        created_at: createdAtStr || undefined,
      };
    });
    
    return <AccessList rows={data} />;
  } catch (error: any) {
    return <p className="formerr">Could not load the allowlist: {error.message}</p>;
  }
}
