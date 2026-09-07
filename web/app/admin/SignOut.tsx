"use client";

import { supabaseBrowser } from "@/lib/supabase/browser";

export default function SignOut() {
  return (
    <button
      type="button"
      className="adm__signout"
      onClick={async () => {
        await supabaseBrowser().auth.signOut();
        window.location.href = "/admin";
      }}
    >
      Sign out
    </button>
  );
}
