import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { uid, email, name, company, phone } = await request.json();

    if (!uid || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isEmployee = email.toLowerCase().endsWith("@ecrentals.co.za");
    const role = isEmployee ? "employee" : "customer";

    const { db } = getFirebaseAdmin();
    const userRef = db.collection("users").doc(uid);

    const userDoc = await userRef.get();
    const now = new Date();

    if (!userDoc.exists) {
      await userRef.set({
        uid,
        email: email.toLowerCase(),
        name: name || null,
        company: company || null,
        phone: phone || null,
        role,
        createdAt: now,
        lastLoginAt: now,
      });

      // If employee, also ensure they are in admin_emails
      if (isEmployee) {
        await db.collection("admin_emails").doc(email.toLowerCase()).set({
          email: email.toLowerCase(),
          role: "employee",
          name: name || null,
          addedAt: now,
        }, { merge: true });
      }
    } else {
      await userRef.update({
        lastLoginAt: now,
        ...(name ? { name } : {}),
        ...(company ? { company } : {}),
        ...(phone ? { phone } : {}),
      });
    }

    return NextResponse.json({
      success: true,
      role,
      isEmployee,
    });
  } catch (error: any) {
    console.error("User sync error:", error);
    return NextResponse.json({ error: error.message || "Failed to sync user" }, { status: 500 });
  }
}
