"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { getBasket, updateLine, removeLine, clearBasket, BASKET_EVENT } from "@/lib/basket";
import { ENQUIRY_REASONS } from "@/lib/reasons";
import { submitEnquiry } from "./actions";
import type { BasketLine } from "@/lib/types";

export default function EnquiryForm() {
  const router = useRouter();
  const [lines, setLines] = useState<BasketLine[]>([]);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    const sync = () => setLines(getBasket());
    sync();
    setReady(true);
    window.addEventListener(BASKET_EVENT, sync);
    return () => window.removeEventListener(BASKET_EVENT, sync);
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const totalUnits = lines.reduce((n, l) => n + l.qty, 0);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const f = new FormData(e.currentTarget);

    start(async () => {
      const res = await submitEnquiry({
        name: String(f.get("name") ?? ""),
        company: String(f.get("company") ?? ""),
        email: String(f.get("email") ?? ""),
        phone: String(f.get("phone") ?? ""),
        deliverySite: String(f.get("deliverySite") ?? ""),
        reason: String(f.get("reason") ?? ""),
        projectStartDate: String(f.get("projectStartDate") ?? ""),
        notes: String(f.get("notes") ?? ""),
        consent: f.get("consent") === "on",
        website: String(f.get("website") ?? ""),
        items: lines,
      });

      if (!res.ok) {
        setErr(res.error);
        return;
      }
      clearBasket();
      router.push(`/enquiry/thank-you?ref=${encodeURIComponent(res.reference)}`);
    });
  }

  if (!ready) return null;

  if (lines.length === 0) {
    return (
      <div className="empty">
        <h2>Your enquiry is empty</h2>
        <p>
          Browse the fleet and add what the job needs — plant, vehicles, tools and operators can
          all go on one enquiry. We quote it as a single job.
        </p>
        <div className="hero__cta" style={{ marginTop: 24 }}>
          <Link className="btn btn--primary" href="/equipment">Browse Equipment</Link>
          <Link className="btn btn--ghost" href="/tools">Browse Tools</Link>
        </div>
      </div>
    );
  }

  return (
    <form className="checkout" onSubmit={onSubmit} noValidate>
      {/* ---------- basket ---------- */}
      <section className="checkout__basket">
        <h2 className="checkout__h">
          Your enquiry
          <span className="num">{lines.length} line{lines.length === 1 ? "" : "s"} · {totalUnits} unit{totalUnits === 1 ? "" : "s"}</span>
        </h2>

        <ul className="blines">
          {lines.map((l) => (
            <li className="bline" key={l.equipmentId}>
              <div className="bline__t">
                <Link href={`/equipment/item/${l.slug}`}>{l.title}</Link>
              </div>
              <div className="bline__f">
                <label>
                  <span>Qty</span>
                  <input
                    type="number" min={1} max={99} value={l.qty}
                    onChange={(e) =>
                      updateLine(l.equipmentId, { qty: Math.max(1, Number(e.target.value) || 1) })}
                  />
                </label>
                <label>
                  <span>Days</span>
                  <input
                    type="number" min={1} value={l.days}
                    onChange={(e) =>
                      updateLine(l.equipmentId, { days: Math.max(1, Number(e.target.value) || 1) })}
                  />
                </label>
                <label>
                  <span>Required from</span>
                  <input
                    type="date" min={today} value={l.requiredFrom ?? ""}
                    onChange={(e) => updateLine(l.equipmentId, { requiredFrom: e.target.value || null })}
                  />
                </label>
                <button type="button" className="bline__x" onClick={() => removeLine(l.equipmentId)}
                  aria-label={`Remove ${l.title}`}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <Link className="btn btn--ghost btn--sm" href="/equipment">+ Add more equipment</Link>
      </section>

      {/* ---------- contact ---------- */}
      <section className="checkout__contact">
        <h2 className="checkout__h">Where do we send the quote?</h2>

        <div className="fgrid">
          <label className="f">
            <span>Name <i>*</i></span>
            <input name="name" required autoComplete="name" />
          </label>
          <label className="f">
            <span>Company</span>
            <input name="company" autoComplete="organization" />
          </label>
          <label className="f">
            <span>Email <i>*</i></span>
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label className="f">
            <span>Phone <i>*</i></span>
            <input name="phone" type="tel" required autoComplete="tel" placeholder="+27 …" />
          </label>
          <label className="f f--wide">
            <span>Delivery site or town</span>
            <input name="deliverySite" placeholder="e.g. Zondereinde Mine, Thabazimbi" />
          </label>
          <label className="f">
            <span>Reason</span>
            <select name="reason" defaultValue="Quotation">
              {ENQUIRY_REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
          <label className="f">
            <span>Project start date</span>
            <input name="projectStartDate" type="date" min={today} />
          </label>
          <label className="f f--wide">
            <span>Notes</span>
            <textarea name="notes" rows={4}
              placeholder="Site access, induction dates, operator requirements…" />
          </label>
        </div>

        {/* honeypot — hidden from people, irresistible to bots */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <label className="consent">
          <input type="checkbox" name="consent" required />
          <span>
            I consent to EC Rentals storing these details to respond to this enquiry, in line with
            the <Link href="/privacy-policy">POPIA privacy notice</Link>. <i>*</i>
          </span>
        </label>

        {err && <p className="formerr" role="alert">{err}</p>}

        <button className="btn btn--primary btn--lg" type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send Enquiry"}
        </button>

        <p className="checkout__note">
          No payment, no commitment. We reply within 24 hours and confirm availability on
          quotation. Your enquiry goes to both <b>info@</b> and <b>sales@ecrentals.co.za</b>.
        </p>
      </section>
    </form>
  );
}
