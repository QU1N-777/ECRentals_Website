"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { submitQuickQuote } from "@/app/enquiry/quick-actions";
import { ENQUIRY_REASONS } from "@/lib/reasons";

export const OPEN_ENQUIRY = "ecr:open-enquiry";

/** Any button anywhere can open the modal by firing this. */
export function openEnquiry(preselectCategory?: string) {
  window.dispatchEvent(
    new CustomEvent(OPEN_ENQUIRY, { detail: { category: preselectCategory } })
  );
}

type Cat = { slug: string; title: string };

export default function EnquiryModal({ categories }: { categories: Cat[] }) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [done, setDone] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const slug = (e as CustomEvent).detail?.category as string | undefined;
      setPicked(slug ? [slug] : []);
      setDone(null);
      setErr(null);
      setOpen(true);
    };
    window.addEventListener(OPEN_ENQUIRY, onOpen);
    return () => window.removeEventListener(OPEN_ENQUIRY, onOpen);
  }, []);

  // Lock scroll, focus the first field, close on Escape.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstFieldRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab") trapFocus(e, dialogRef.current);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  const today = new Date().toISOString().slice(0, 10);

  const toggle = (slug: string) =>
    setPicked((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const f = new FormData(e.currentTarget);
    start(async () => {
      const res = await submitQuickQuote({
        name: String(f.get("name") ?? ""),
        email: String(f.get("email") ?? ""),
        phone: String(f.get("phone") ?? ""),
        reason: String(f.get("reason") ?? ""),
        categories: picked,
        hireFrom: String(f.get("hireFrom") ?? ""),
        hireTo: String(f.get("hireTo") ?? ""),
        location: String(f.get("location") ?? ""),
        notes: String(f.get("notes") ?? ""),
        consent: f.get("consent") === "on",
        website: String(f.get("website") ?? ""),
      });
      if (!res.ok) setErr(res.error);
      else setDone(res.reference);
    });
  }

  return (
    <div className="modal" role="presentation" onMouseDown={(e) => {
      if (e.target === e.currentTarget) setOpen(false);
    }}>
      <div
        className="modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enq-title"
        ref={dialogRef}
      >
        <button type="button" className="modal__x" onClick={() => setOpen(false)} aria-label="Close">
          ✕
        </button>

        {done ? (
          <div className="modal__done">
            <p className="eyebrow" style={{ marginBottom: 12 }}>Request received</p>
            <h2 id="enq-title">Thank you — we have it.</h2>
            <p className="refbox">
              <span>Your reference</span>
              <b className="num">{done}</b>
            </p>
            <p className="modal__note">
              A confirmation is on its way to your inbox. We come back within <b>24 hours</b>,
              and availability is confirmed on quotation.
            </p>
            <button type="button" className="btn btn--primary" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <div className="modal__head">
              <p className="eyebrow" style={{ marginBottom: 10 }}>Request a quote</p>
              <h2 id="enq-title">Tell us what the job needs</h2>
              <p className="modal__lede">
                We reply within 24 hours. No payment, no commitment — availability is confirmed
                on quotation.
              </p>
            </div>

            <div className="modal__body">
              <div className="fgrid">
                <label className="f">
                  <span>Name &amp; surname <i>*</i></span>
                  <input name="name" ref={firstFieldRef} required autoComplete="name" />
                </label>
                <label className="f">
                  <span>Email <i>*</i></span>
                  <input name="email" type="email" required autoComplete="email" />
                </label>
                <label className="f">
                  <span>Phone <i>*</i></span>
                  <input name="phone" type="tel" required autoComplete="tel" placeholder="+27 …" />
                </label>
                <label className="f">
                  <span>Enquiry reason <i>*</i></span>
                  <select name="reason" required defaultValue="Quotation">
                    {ENQUIRY_REASONS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </label>
              </div>

              <fieldset className="pickset">
                <legend>
                  Equipment required
                  {picked.length > 0 && <b className="num">{picked.length} selected</b>}
                </legend>
                <div className="picks">
                  {categories.map((c) => (
                    <label key={c.slug} className={`pick${picked.includes(c.slug) ? " is-on" : ""}`}>
                      <input
                        type="checkbox"
                        checked={picked.includes(c.slug)}
                        onChange={() => toggle(c.slug)}
                      />
                      <span>{c.title}</span>
                    </label>
                  ))}
                </div>
                <p className="pickset__hint">
                  Tick everything the job needs. Not sure yet? Leave it blank and tell us in the
                  notes.
                </p>
              </fieldset>

              <div className="fgrid">
                <label className="f">
                  <span>Hire from</span>
                  <input name="hireFrom" type="date" min={today} />
                </label>
                <label className="f">
                  <span>Hire until</span>
                  <input name="hireTo" type="date" min={today} />
                </label>
                <label className="f f--wide">
                  <span>Location — where the equipment will be used</span>
                  <input name="location" placeholder="e.g. Zondereinde Mine, Thabazimbi" />
                </label>
                <label className="f f--wide">
                  <span>Notes</span>
                  <textarea name="notes" rows={3}
                    placeholder="Site access, induction dates, operator requirements…" />
                </label>
              </div>

              <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
                <label>
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <label className="consent">
                <input type="checkbox" name="consent" required />
                <span>
                  I consent to EC Rentals storing these details to respond to this enquiry, in
                  line with the <Link href="/privacy-policy">POPIA privacy notice</Link>. <i>*</i>
                </span>
              </label>

              {err && <p className="formerr" role="alert">{err}</p>}
            </div>

            <div className="modal__foot">
              <button className="btn btn--primary btn--lg" type="submit" disabled={pending}>
                {pending ? "Sending…" : "Send Request"}
              </button>
              <p className="modal__note">
                Goes to both <b>info@</b> and <b>sales@ecrentals.co.za</b>.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function trapFocus(e: KeyboardEvent, root: HTMLElement | null) {
  if (!root) return;
  const f = root.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!f.length) return;
  const first = f[0];
  const last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
