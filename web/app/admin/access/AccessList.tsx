"use client";

import { useState } from "react";

type Row = {
  email: string;
  full_name: string | null;
  role?: string | null;
  note?: string | null;
  created_at?: string;
};

export default function AccessList({ rows: initial }: { rows: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Fleet Admin");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [lastCreated, setLastCreated] = useState<{ email: string; pass: string } | null>(null);

  function generatePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
    let gen = "";
    for (let i = 0; i < 10; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(gen);
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    setLastCreated(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!password || password.length < 6) {
      setErr("Password must be at least 6 characters long.");
      setBusy(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          fullName: name.trim() || null,
          role,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create user account.");
      }

      const newRow: Row = {
        email: cleanEmail,
        full_name: name.trim() || null,
        role,
        created_at: new Date().toISOString(),
      };

      setRows((r) => [newRow, ...r.filter((x) => x.email !== cleanEmail)]);
      setLastCreated({ email: cleanEmail, pass: password });
      setMsg(`✓ Successfully granted admin access and configured login account for ${cleanEmail}!`);
      setEmail("");
      setName("");
      setPassword("");
    } catch (error: any) {
      setErr(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(target: string) {
    if (rows.length <= 1) {
      setErr("Cannot remove the only administrator. Add another admin account first.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently revoke admin access for ${target}?\n\nThey will immediately be blocked from logging into the console.`
    );
    if (!confirmed) return;

    setBusy(true);
    setErr(null);
    setMsg(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: target }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user.");
      }

      setRows((r) => r.filter((x) => x.email !== target));
      setMsg(`Revoked admin access for ${target}.`);
    } catch (error: any) {
      setErr(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="adm__head">
        <div>
          <h1>Admin Team &amp; Access Control</h1>
          <p>
            Manage team members who can sign in to this admin console. Creating an account sets up
            their Firebase Auth credentials and permissions immediately.
          </p>
        </div>
      </div>

      {msg && <p className="adm__ok" role="status">{msg}</p>}
      {err && <p className="formerr" role="alert">{err}</p>}

      {/* Copyable Login Credentials Card for newly created user */}
      {lastCreated && (
        <div
          style={{
            background: "rgba(245, 165, 36, 0.1)",
            border: "1px solid var(--amber)",
            borderRadius: 6,
            padding: "16px 20px",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong style={{ color: "var(--amber)", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              📋 Share Login Credentials With Team Member
            </strong>
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              style={{ padding: "3px 8px", fontSize: 11 }}
              onClick={() => {
                const text = `EC Rentals Admin Access:\nEmail: ${lastCreated.email}\nPassword: ${lastCreated.pass}\nURL: https://ecrentals.web.app/admin`;
                navigator.clipboard.writeText(text);
                alert("Copied credentials to clipboard!");
              }}
            >
              Copy Credentials
            </button>
          </div>
          <div style={{ fontSize: 13.5, color: "#fff", display: "flex", gap: 24, flexWrap: "wrap" }}>
            <span><b>Email:</b> {lastCreated.email}</span>
            <span><b>Temporary Password:</b> <code style={{ background: "#000", padding: "2px 6px", borderRadius: 3, color: "var(--amber)" }}>{lastCreated.pass}</code></span>
            <span><b>Login Link:</b> <a href="/admin" target="_blank" style={{ color: "var(--amber)", textDecoration: "underline" }}>ecrentals.web.app/admin</a></span>
          </div>
        </div>
      )}

      {/* Add New Team Member Form */}
      <form
        className="accessadd"
        onSubmit={add}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          alignItems: "flex-end",
          background: "var(--char)",
          border: "1px solid var(--char2)",
          borderRadius: 6,
          padding: 20,
          marginBottom: 32,
        }}
      >
        <label className="f" style={{ margin: 0 }}>
          <span>Email Address *</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@ecrentals.co.za"
          />
        </label>

        <label className="f" style={{ margin: 0 }}>
          <span>Full Name (Optional)</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Johan van der Merwe"
          />
        </label>

        <label className="f" style={{ margin: 0 }}>
          <span>Role / Designation</span>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Fleet Admin">Fleet Administrator</option>
            <option value="Operations & Dispatch">Operations &amp; Dispatch</option>
            <option value="Company Owner">Company Owner / Director</option>
          </select>
        </label>

        <label className="f" style={{ margin: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Initial Password *</span>
            <button
              type="button"
              onClick={generatePassword}
              style={{
                background: "none",
                border: "none",
                color: "var(--amber)",
                cursor: "pointer",
                fontSize: 11,
                padding: 0,
                textDecoration: "underline",
              }}
            >
              🎲 Auto-Generate
            </button>
          </div>
          <input
            type="text"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
          />
        </label>

        <div>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={busy}
            style={{ width: "100%", height: 44 }}
          >
            {busy ? "Provisioning…" : "+ Grant & Create Account"}
          </button>
        </div>
      </form>

      {/* Existing Admins List */}
      <h2 style={{ fontSize: 16, textTransform: "uppercase", color: "#fff", marginBottom: 14 }}>
        Active Admin Team ({rows.length})
      </h2>

      <ul className="erows">
        {rows.map((r) => (
          <li className="erow" key={r.email}>
            <div className="erow__top">
              <span className="erow__name" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <b>{r.full_name || r.email}</b>
                {r.full_name && <em>{r.email}</em>}
                <span
                  style={{
                    fontFamily: "Archivo, sans-serif",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    padding: "3px 8px",
                    borderRadius: 3,
                    background: "rgba(245, 165, 36, 0.15)",
                    border: "1px solid rgba(245, 165, 36, 0.4)",
                    color: "var(--amber)",
                  }}
                >
                  {r.role || "Admin"}
                </span>
              </span>

              <button
                type="button"
                className="erow__remove"
                onClick={() => remove(r.email)}
                disabled={busy}
                title="Revoke admin access"
              >
                Revoke
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="adm__note">
        Access is checked on every authenticated request against this list. When an admin is
        revoked, their session is terminated and their login is blocked.
      </p>
    </>
  );
}
