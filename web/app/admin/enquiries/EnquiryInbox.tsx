"use client";

import { useMemo, useState } from "react";
import { getFirebaseClient } from "@/lib/firebase/client";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import LeadInsightsWidget from "@/components/admin/LeadInsightsWidget";

type Enquiry = {
  id: string;
  reference: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  delivery_site: string | null;
  reason: string | null;
  hire_from: string | null;
  hire_to: string | null;
  categories: string[] | null;
  project_start_date: string | null;
  notes: string | null;
  items_summary: string | null;
  status: string;
  submitted_at: string;
};

type Line = {
  id: string;
  enquiry_id: string;
  item_title: string;
  quantity: number;
  days: number | null;
  required_from: string | null;
};

const STATUSES = ["New", "Quoted", "Won", "Lost"] as const;

export default function EnquiryInbox({
  enquiries: initial,
  lines,
  equipmentCount = 0,
  availableCount = 0,
}: {
  enquiries: Enquiry[];
  lines: Line[];
  equipmentCount?: number;
  availableCount?: number;
}) {
  const [rows, setRows] = useState(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"glass" | "list">("glass");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const byEnquiry = useMemo(() => {
    const m = new Map<string, Line[]>();
    for (const l of lines) {
      const g = m.get(l.enquiry_id) ?? [];
      g.push(l);
      m.set(l.enquiry_id, g);
    }
    return m;
  }, [lines]);

  const shown = status === "all" ? rows : rows.filter((r) => (r.status || "New").toLowerCase() === status.toLowerCase());

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const st = r.status || "New";
      m.set(st, (m.get(st) ?? 0) + 1);
    }
    return m;
  }, [rows]);

  async function setStatusFor(id: string, next: string) {
    const prev = rows;
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status: next } : x)));
    setErr(null);
    try {
      const { db } = getFirebaseClient();
      await updateDoc(doc(db, "enquiries", id), { status: next });
    } catch (error: any) {
      setRows(prev); // roll back
      setErr(error.message);
    }
  }

  async function handleDeleteEnquiry(id: string, ref: string) {
    const confirmed = window.confirm(`Permanently delete quotation enquiry ${ref}? This action cannot be undone.`);
    if (!confirmed) return;

    const prev = rows;
    setRows((r) => r.filter((x) => x.id !== id));
    try {
      const { db } = getFirebaseClient();
      await deleteDoc(doc(db, "enquiries", id));
    } catch (error: any) {
      setRows(prev);
      setErr("Failed to delete enquiry: " + error.message);
    }
  }

  const fmt = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("en-ZA", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Johannesburg",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  function getCleanPhone(raw: string | null) {
    if (!raw) return "";
    let clean = raw.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) {
      clean = "27" + clean.slice(1);
    }
    return clean;
  }

  function getWhatsAppUrl(e: Enquiry, items: Line[]) {
    const phone = getCleanPhone(e.phone);
    if (!phone) return "";

    const itemsText = items.length > 0
      ? items.map((i) => `${i.quantity}x ${i.item_title}`).join(", ")
      : e.items_summary || "plant and vehicle hire";

    const message = `Hi ${e.name.split(" ")[0]}, this is EC Rentals following up on your quote enquiry [${e.reference}] regarding ${itemsText} for ${e.delivery_site || "your project site"}. We have reviewed machinery availability. Would you like to proceed with the quote?`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  function copyQuoteSummary(e: Enquiry, items: Line[]) {
    const itemsList = items.length > 0
      ? items.map((i) => `• ${i.quantity}x ${i.item_title} (${i.days || 1} days, from ${i.required_from || "ASAP"})`).join("\n")
      : `• ${e.items_summary || "General machinery request"}`;

    const text = `EC RENTALS QUOTATION SUMMARY
-----------------------------------
Reference: ${e.reference}
Date: ${fmt(e.submitted_at)}
Client: ${e.name}
Company: ${e.company || "Direct Contractor"}
Phone: ${e.phone || "—"}
Email: ${e.email}
Site Location: ${e.delivery_site || "Gauteng / Vaal Triangle"}
Hire Period: ${[e.hire_from, e.hire_to].filter(Boolean).join(" to ") || "Standard"}

REQUESTED EQUIPMENT:
${itemsList}

${e.notes ? `CLIENT NOTES:\n${e.notes}\n` : ""}
Status: ${e.status || "New"}
`;

    navigator.clipboard.writeText(text);
    setCopiedId(e.id);
    setTimeout(() => setCopiedId(null), 3000);
  }

  return (
    <>
      <div className="adm__head">
        <div>
          <h1>Enquiries &amp; Quotation Pipeline</h1>
          <p>
            Track incoming quotation requests, view interactive Glass Cards, and reply directly via
            WhatsApp, Email, or clipboard export.
          </p>
        </div>
      </div>

      {err && <p className="formerr" role="alert">{err}</p>}

      {/* Demand & Pipeline Insights Widget */}
      <LeadInsightsWidget
        enquiries={rows}
        lines={lines}
        equipmentCount={equipmentCount}
        availableCount={availableCount}
      />

      {/* Filter Chips & View Mode Switcher */}
      <div className="adm__filters" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className={`chip chip--btn${status === "all" ? " is-on" : ""}`}
            onClick={() => setStatus("all")}
          >
            All<b className="num">{rows.length}</b>
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`chip chip--btn${status.toLowerCase() === s.toLowerCase() ? " is-on" : ""}`}
              onClick={() => setStatus(s)}
            >
              {s}<b className="num">{counts.get(s) ?? 0}</b>
            </button>
          ))}
        </div>

        <div className="view-switch">
          <button
            type="button"
            className={`view-switch__btn ${viewMode === "glass" ? "active" : ""}`}
            onClick={() => setViewMode("glass")}
            title="Glass Cards Mode"
          >
            🎴 Glass Cards
          </button>
          <button
            type="button"
            className={`view-switch__btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            title="List Table Mode"
          >
            📋 List Mode
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="adm__empty">
          <h2>No enquiries in this status</h2>
          <p>
            Quotation requests land here the moment someone submits one — whether they used the
            quick-quote modal or built an itemised enquiry.
          </p>
        </div>
      ) : viewMode === "glass" ? (
        /* ============================================================== */
        /* VIEW 1: MODERN GLASS CARDS VIEW                                 */
        /* ============================================================== */
        <div className="glass-enquiry-grid">
          {shown.map((e) => {
            const items = byEnquiry.get(e.id) ?? [];
            const waUrl = getWhatsAppUrl(e, items);
            const isCopied = copiedId === e.id;

            return (
              <div className="glass-enquiry-card" key={e.id}>
                {/* Header: Ref, SAST Date, Status */}
                <div className="glass-enquiry-top">
                  <div>
                    <div className="glass-enquiry-ref">{e.reference}</div>
                    <div className="glass-enquiry-date">{fmt(e.submitted_at)}</div>
                  </div>

                  <select
                    className={`estat estat--${(e.status || "new").toLowerCase()}`}
                    value={e.status || "New"}
                    onChange={(ev) => setStatusFor(e.id, ev.target.value)}
                    style={{ fontSize: 11, padding: "4px 8px" }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Client Profile */}
                <div className="glass-enquiry-client">
                  <div className="glass-client-name">{e.name}</div>
                  {e.company && <div className="glass-client-comp">{e.company}</div>}

                  <div className="glass-client-contact">
                    <a href={`mailto:${e.email}`} style={{ color: "var(--steel-lift)", textDecoration: "underline" }}>
                      ✉️ {e.email}
                    </a>
                    {e.phone && (
                      <a href={`tel:${e.phone}`} style={{ color: "var(--steel-lift)", textDecoration: "underline" }}>
                        📞 {e.phone}
                      </a>
                    )}
                  </div>

                  <div style={{ marginTop: 6, fontSize: 12, color: "var(--steel-lift)" }}>
                    📍 <b>Location:</b> {e.delivery_site || "Not specified (Inbound Quote)"}
                  </div>

                  {(e.hire_from || e.hire_to || e.project_start_date) && (
                    <div style={{ fontSize: 12, color: "var(--steel-lift)" }}>
                      📅 <b>Hire Window:</b>{" "}
                      {[e.hire_from, e.hire_to].filter(Boolean).join(" → ") ||
                        e.project_start_date ||
                        "—"}
                    </div>
                  )}
                </div>

                {/* Requested Equipment Summary Box */}
                <div className="glass-enquiry-items">
                  <div className="glass-items-title">Requested Fleet &amp; Tools</div>
                  {items.length > 0 ? (
                    <ul className="glass-items-list">
                      {items.map((item, idx) => (
                        <li key={item.id || idx} className="glass-item-row">
                          <span>{item.item_title}</span>
                          <b>
                            {item.quantity}x
                            {item.days ? ` · ${item.days}d` : ""}
                          </b>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ margin: 0, fontSize: 13, color: "#fff" }}>
                      {e.items_summary || (e.categories && e.categories.join(", ")) || "Standard Quick Quote Request"}
                    </p>
                  )}
                </div>

                {/* Client Notes if any */}
                {e.notes && (
                  <div style={{ fontSize: 12.5, color: "#c4c8d0", background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: 4 }}>
                    <b style={{ color: "var(--amber)", display: "block", marginBottom: 2 }}>Notes:</b>
                    {e.notes}
                  </div>
                )}

                {/* Direct Interaction Action Bar */}
                <div className="glass-enquiry-actions">
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-wa"
                      title="Reply via WhatsApp with pre-filled quote greeting"
                    >
                      <span>💬 WhatsApp</span>
                    </a>
                  )}

                  <a
                    href={`mailto:${e.email}?subject=${encodeURIComponent(
                      `EC Rentals Quotation — ${e.reference}`
                    )}`}
                    className="btn-mail"
                    title="Send Email Quote"
                  >
                    <span>✉️ Email</span>
                  </a>

                  <button
                    type="button"
                    className="btn-copy"
                    onClick={() => copyQuoteSummary(e, items)}
                    title="Copy full quotation draft to clipboard"
                  >
                    <span>{isCopied ? "✓ Copied" : "📋 Copy"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteEnquiry(e.id, e.reference)}
                    style={{
                      marginLeft: "auto",
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      padding: "4px",
                      opacity: 0.7,
                    }}
                    title="Delete enquiry"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ============================================================== */
        /* VIEW 2: COMPACT LIST / TABLE VIEW                               */
        /* ============================================================== */
        <ul className="erows">
          {shown.map((e) => {
            const open = openId === e.id;
            const items = byEnquiry.get(e.id) ?? [];
            const waUrl = getWhatsAppUrl(e, items);

            return (
              <li className="erow" key={e.id}>
                <div className="erow__top">
                  <button
                    type="button"
                    className="erow__name"
                    onClick={() => setOpenId(open ? null : e.id)}
                    aria-expanded={open}
                  >
                    <b>{e.company || e.name}</b>
                    <em>
                      {e.reference} · {fmt(e.submitted_at)}
                    </em>
                  </button>

                  <span className="erow__flags">
                    {items.length > 0 && (
                      <span className="flag">{items.length} item{items.length === 1 ? "" : "s"}</span>
                    )}
                    {e.reason && <span className="flag">{e.reason}</span>}
                  </span>

                  <select
                    className={`estat estat--${(e.status || "new").toLowerCase()}`}
                    value={e.status || "New"}
                    onChange={(ev) => setStatusFor(e.id, ev.target.value)}
                    aria-label={`Status for ${e.reference}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {open && (
                  <div className="erow__body">
                    <div className="enqdet">
                      <dl>
                        <div><dt>Name</dt><dd>{e.name}</dd></div>
                        <div><dt>Email</dt><dd><a href={`mailto:${e.email}`}>{e.email}</a></dd></div>
                        {e.phone && <div><dt>Phone</dt><dd><a href={`tel:${e.phone}`}>{e.phone}</a></dd></div>}
                        {e.delivery_site && <div><dt>Location</dt><dd>{e.delivery_site}</dd></div>}
                        {(e.hire_from || e.hire_to) && (
                          <div>
                            <dt>Hire window</dt>
                            <dd>{[e.hire_from, e.hire_to].filter(Boolean).join(" → ") || "—"}</dd>
                          </div>
                        )}
                        {e.categories && e.categories.length > 0 && (
                          <div><dt>Categories</dt><dd>{e.categories.join(", ")}</dd></div>
                        )}
                      </dl>

                      {items.length > 0 && (
                        <table className="enqtab">
                          <thead>
                            <tr><th>Item</th><th>Qty</th><th>Days</th><th>From</th></tr>
                          </thead>
                          <tbody>
                            {items.map((l, idx) => (
                              <tr key={l.id || idx}>
                                <td>{l.item_title}</td>
                                <td className="num">{l.quantity}</td>
                                <td className="num">{l.days ?? "—"}</td>
                                <td>{l.required_from ?? "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {e.notes && (
                        <div className="enqnotes">
                          <span className="afield__label">Notes</span>
                          <p>{e.notes}</p>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                        {waUrl && (
                          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-wa">
                            💬 WhatsApp {e.name.split(" ")[0]}
                          </a>
                        )}
                        <a
                          className="btn btn--ghost btn--sm"
                          href={`mailto:${e.email}?subject=${encodeURIComponent(`EC Rentals — ${e.reference}`)}`}
                        >
                          ✉️ Email Reply
                        </a>
                        <button
                          type="button"
                          className="btn-copy"
                          onClick={() => copyQuoteSummary(e, items)}
                        >
                          📋 Copy Summary
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
