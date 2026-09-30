"use client";

import { getFirebaseClient } from "@/lib/firebase/client";
import { signOut as firebaseSignOut } from "firebase/auth";

export default function SignOut() {
  return (
    <button
      type="button"
      className="adm__signout"
      onClick={async () => {
        try {
          const { auth } = getFirebaseClient();
          await firebaseSignOut(auth);
          await fetch("/api/session", { method: "DELETE" });
          window.location.href = "/admin";
        } catch (error) {
          console.error(error);
        }
      }}
    >
      Sign out
    </button>
  );
}
