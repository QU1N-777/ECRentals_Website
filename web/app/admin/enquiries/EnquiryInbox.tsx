"use client";

import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

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
}: {
  enquiries: Enquiry[];
  lines: Line[];
}) {
  const [rows, setRows] = useState(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("all");
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

  const shown = status === "all" ? rows : rows.filter((r) => r.status === status);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(r.status, (m.get(r.status) ?? 0) + 1);
    return m;
  }, [rows]);

  async function setStatusFor(id: string, next: string) {
    const prev = rows;
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status: next } : x)));
    setErr(null);
    const { error } = await supabaseBrowser()
      .from("enquiries")
      .update({ status: next })
      .eq("id", id);
    if (error) {
      setRows(prev); // roll back rather than show a lie
      setErr(error.message);
    }
  }

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("en-ZA", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Africa/Johannesburg",
    }).format(new Date(iso));

  return (
    <>
      <div className="adm__head">
        <div>
          <h1>Enquiries</h1>
          <p>
            Every quotation request, newest first. Status is saved the moment you change it.
            Times are SAST.
          </p>
        </div>
      </div>

      {err && <p className="formerr" role="alert">{err}</p>}

      <div className="adm__filters">
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
            className={`chip chip--btn${status === s ? " is-on" : ""}`}
            onClick={() => setStatus(s)}
          >
            {s}<b className="num">{counts.get(s) ?? 0}</b>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="adm__empty">
          <h2>Nothing here yet</h2>
          <p>
            Quotation requests land here the moment someone submits one — whether they used the
            quick-quote modal or built an itemised enquiry.
          </p>
        </div>
      ) : (
        <ul className="erows">
          {shown.map((e) => {
            const open = openId === e.id;
            const items = byEnquiry.get(e.id) ?? [];
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
                      <span className="flag">{items.length} line{items.length === 1 ? "" : "s"}</span>
                    )}
                    {e.reason && <span className="flag">{e.reason}</span>}
                  </span>

                  <select
                    className={`estat estat--${e.status.toLowerCase()}`}
                    value={e.status}
                    onChange={(ev) => setStatusFor(e.id, ev.target.value)}
                    aria-label={`Status for ${e.reference}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
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
                            {items.map((l) => (
                              <tr key={l.id}>
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

                      <a className="btn btn--ghost btn--sm" href={`mailto:${e.email}?subject=${encodeURIComponent(`EC Rentals — ${e.reference}`)}`}>
                        Reply to {e.name.split(" ")[0]}
                      </a>
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
