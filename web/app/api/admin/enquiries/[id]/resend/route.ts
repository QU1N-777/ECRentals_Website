import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/firebase/session";
import { getFirebaseAdmin } from "@/lib/firebase/server";
import { sendEnquiryNotification } from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin } = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { db } = getFirebaseAdmin();
    const docRef = db.collection("enquiries").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    const data = doc.data() || {};
    const items = Array.isArray(data.items)
      ? data.items.map((i: any) => ({
          title: i.item_title || i.title || "Equipment Item",
          qty: i.quantity || i.qty || 1,
          days: i.days || 1,
          requiredFrom: i.required_from || i.requiredFrom || "ASAP",
        }))
      : [];

    const result = await sendEnquiryNotification({
      reference: data.reference || `ECR-ENQ-${id.slice(0, 6)}`,
      name: data.name || "Customer",
      company: data.company,
      email: data.email,
      phone: data.phone,
      reason: data.reason,
      deliverySite: data.delivery_site,
      projectStartDate: data.project_start_date,
      hireFrom: data.hire_from,
      hireTo: data.hire_to,
      notes: data.notes,
      items,
      submittedAt: data.submitted_at || new Date().toISOString(),
    });

    await docRef.update({
      email_status: result.status,
      email_sent_at: result.success ? new Date().toISOString() : null,
      email_error: result.error || null,
      email_resend_attempted_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: result.success,
      status: result.status,
      error: result.error,
      internalId: result.internalId,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to resend email" }, { status: 500 });
  }
}
