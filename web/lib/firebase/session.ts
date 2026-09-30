import { cookies } from "next/headers";
import { getFirebaseAdmin } from "./server";

export type AdminCheck = {
  email: string | null;
  isAdmin: boolean;
};

/**
 * Checks if the request has a valid Firebase Auth session cookie and whether
 * that user exists in the admin_emails Firestore collection.
 */
export async function checkAdmin(): Promise<AdminCheck> {
  const store = await cookies();
  const sessionCookie = store.get("__session")?.value;

  if (!sessionCookie) {
    return { email: null, isAdmin: false };
  }

  try {
    const { auth, db } = getFirebaseAdmin();
    // Verify the session cookie
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const email = decodedClaims.email || null;

    if (!email) {
      return { email: null, isAdmin: false };
    }

    // Employees with @ecrentals.co.za domain are automatically admins
    const isEmployee = email.toLowerCase().endsWith("@ecrentals.co.za");
    const adminDoc = await db.collection("admin_emails").doc(email.toLowerCase()).get();
    
    return { email, isAdmin: isEmployee || adminDoc.exists };
  } catch (error) {
    // Invalid session cookie or expired
    return { email: null, isAdmin: false };
  }
}
