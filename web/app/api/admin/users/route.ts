import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/server";
import { checkAdmin } from "@/lib/firebase/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin();
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { email, password, fullName, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const { auth, db } = getFirebaseAdmin();

    // 1. Create or update user in Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(cleanEmail);
      // If user already exists in Auth, update password and display name
      await auth.updateUser(userRecord.uid, {
        password,
        displayName: fullName?.trim() || userRecord.displayName,
      });
    } catch (e: any) {
      if (e.code === "auth/user-not-found") {
        userRecord = await auth.createUser({
          email: cleanEmail,
          password,
          displayName: fullName?.trim() || undefined,
        });
      } else {
        throw e;
      }
    }

    // 2. Add to admin_emails Firestore collection
    const adminData = {
      email: cleanEmail,
      full_name: fullName?.trim() || null,
      role: role || "Fleet Admin",
      created_at: new Date().toISOString(),
      created_by: adminCheck.email,
    };

    await db.collection("admin_emails").doc(cleanEmail).set(adminData, { merge: true });

    return NextResponse.json({ success: true, user: adminData });
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin();
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const { auth, db } = getFirebaseAdmin();

    // Check count of admins so we don't delete the last one
    const adminsSnap = await db.collection("admin_emails").get();
    if (adminsSnap.docs.length <= 1) {
      return NextResponse.json({ error: "Cannot delete the last remaining admin." }, { status: 400 });
    }

    // Remove from Firestore admin_emails
    await db.collection("admin_emails").doc(cleanEmail).delete();

    // Remove from Firebase Auth if exists
    try {
      const user = await auth.getUserByEmail(cleanEmail);
      if (user) {
        await auth.deleteUser(user.uid);
      }
    } catch {
      // User might not exist in auth
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting admin user:", error);
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
