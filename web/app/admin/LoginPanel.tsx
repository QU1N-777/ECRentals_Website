"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Mode = "password" | "link";

/**
 * Two ways in.
 *  - Password: the everyday route for EC Rentals staff.
 *  - Magic link: no password to remember or reset, useful for occasional users
 *    and as a recovery path if a password is forgotten.
 * Either way, the address must be on the admin allowlist.
 */
export default function LoginPanel({ signedInAs }: { signedInAs: string | null }) {
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { error } = await supabaseBrowser().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      setErr(
        /invalid login credentials/i.test(error.message)
          ? "That email and password combination was not recognised."
          : error.message
      );
      return;
    }
    window.location.href = "/admin";
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  async function signOut() {
    await supabaseBrowser().auth.signOut();
    window.location.reload();
  }

  return (
    <div className="login">
      <div className="login__brand">
        EC<span>&nbsp;RENTALS</span>
      </div>

      {signedInAs ? (
        <>
          <h1>Not authorised</h1>
          <p className="login__lede">
            You are signed in as <b>{signedInAs}</b>, but that address is not on the admin
            allowlist. Ask an existing admin to add it, then sign in again.
          </p>
          <button className="btn btn--ghost" type="button" onClick={signOut}>
            Sign out
          </button>
        </>
      ) : sent ? (
        <>
          <h1>Check your email</h1>
          <p className="login__lede">
            We sent a sign-in link to <b>{email}</b>. It opens the admin directly. The link is
            single-use and expires shortly.
          </p>
          <button className="btn btn--ghost" type="button" onClick={() => setSent(false)}>
            Back
          </button>
        </>
      ) : (
        <>
          <h1>Admin sign in</h1>

          <div className="login__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "password"}
              className={mode === "password" ? "is-on" : ""}
              onClick={() => { setMode("password"); setErr(null); }}
            >
              Password
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "link"}
              className={mode === "link" ? "is-on" : ""}
              onClick={() => { setMode("link"); setErr(null); }}
            >
              Email link
            </button>
          </div>

          <form onSubmit={mode === "password" ? signInWithPassword : sendLink}>
            <label className="f">
              <span>Email address</span>
              <input
                type="email"
                required
                autoFocus
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ecrentals.co.za"
              />
            </label>

            {mode === "password" && (
              <label className="f">
                <span>Password</span>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            )}

            {err && <p className="formerr" role="alert">{err}</p>}

            <button className="btn btn--primary btn--lg" type="submit" disabled={busy}>
              {busy
                ? mode === "password" ? "Signing in…" : "Sending…"
                : mode === "password" ? "Sign in" : "Send sign-in link"}
            </button>
          </form>

          <p className="login__foot">
            {mode === "password"
              ? "Forgotten the password? Use the email link instead — it signs you in without one."
              : "We email you a single-use link. Nothing to remember."}
          </p>
        </>
      )}
    </div>
  );
}
