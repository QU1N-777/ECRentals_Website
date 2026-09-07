"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Row = { email: string; full_name: string | null; note: string | null; created_at: string };

export default function AccessList({ rows: initial }: { rows: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { data, error } = await supabaseBrowser()
      .from("admin_emails")
      .insert({ email: email.trim().toLowerCase(), full_name: name.trim() || null })
      .select()
      .single();
    setBusy(false);
    if (error) {
      setErr(/duplicate/i.test(error.message) ? "That address already has access." : error.message);
      return;
    }
    setRows((r) => [...r, data as Row]);
    setEmail("");
    setName("");
  }

  async function remove(target: string) {
    if (rows.length === 1) {
      setErr("That is the only admin. Add another before removing this one.");
      return;
    }
    const prev = rows;
    setRows((r) => r.filter((x) => x.email !== target));
    const { error } = await supabaseBrowser().from("admin_emails").delete().eq("email", target);
    if (error) {
      setRows(prev);
      setErr(error.message);
    }
  }

  return (
    <>
      <div className="adm__head">
        <div>
          <h1>Access</h1>
          <p>
            Who can sign in to this admin. Add an address to grant access, delete it to revoke —
            there are no passwords to issue or reset.
          </p>
        </div>
      </div>

      {err && <p className="formerr" role="alert">{err}</p>}

      <form className="accessadd" onSubmit={add}>
        <label className="f">
          <span>Email address</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@ecrentals.co.za"
          />
        </label>
        <label className="f">
          <span>Name (optional)</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <button className="btn btn--primary" disabled={busy}>
          {busy ? "Adding…" : "Grant access"}
        </button>
      </form>

      <ul className="erows">
        {rows.map((r) => (
          <li className="erow" key={r.email}>
            <div className="erow__top">
              <span className="erow__name">
                <b>{r.full_name || r.email}</b>
                {r.full_name && <em>{r.email}</em>}
                {r.note && <em>{r.note}</em>}
              </span>
              <button type="button" className="erow__remove" onClick={() => remove(r.email)}>
                Revoke
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="adm__note">
        Access is checked on every request against this list, so revoking takes effect
        immediately — an already-signed-in person loses admin on their next page load.
      </p>
    </>
  );
}
