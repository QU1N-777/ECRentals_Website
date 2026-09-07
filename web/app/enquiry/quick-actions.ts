"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Quick quote — the modal behind every "Request a Quote" / "Enquiry" button.
 *
 * Captures equipment *categories* and a hire window rather than specific line
 * items, so someone can ask for a price without first building a basket. The
 * item-level basket at /enquiry still exists for people who browse first.
 *
 * Self-contained by design: a "use server" module may only export async
 * functions, so the small helpers below cannot be shared from actions.ts.
 */

const Payload = z.object({
  name: z.string().trim().min(2, "Please give us a name and surname.").max(120),
  email: z.string().trim().email("That email address doesn't look right.").max(160),
  phone: z.string().trim().min(6, "We need a number to call you back on.").max(40),
  reason: z.string().trim().min(1, "Please choose an enquiry reason.").max(80),
  categories: z.array(z.string().max(80)).max(20),
  hireFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  hireTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
  consent: z.literal(true, {
    errorMap: () => ({ message: "We need your consent to store these details." }),
  }),
  website: z.string().max(0, "Rejected."), // honeypot
});

export type QuickResult =
  | { ok: true; reference: string }
  | { ok: false; error: string; field?: string };

const seen = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (seen.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  hits.push(now);
  seen.set(ip, hits);
  return hits.length > 5;
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

export async function submitQuickQuote(raw: unknown): Promise<QuickResult> {
  const parsed = Payload.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message, field: String(first.path[0] ?? "") };
  }
  const d = parsed.data;

  if (d.hireFrom && d.hireTo && d.hireTo < d.hireFrom) {
    return { ok: false, error: "The end date cannot be before the start date.", field: "hireTo" };
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return { ok: false, error: "Too many requests from this connection. Please phone us instead." };
  }

  const db = supabaseAdmin();

  // Resolve slugs to titles so the email reads like a person wrote it.
  let titles: string[] = [];
  if (d.categories.length) {
    const { data } = await db
      .from("equipment_categories")
      .select("slug,title")
      .in("slug", d.categories);
    const map = new Map((data ?? []).map((c) => [c.slug, c.title]));
    titles = d.categories.map((s) => map.get(s) ?? s);
  }

  const window =
    d.hireFrom && d.hireTo
      ? `${d.hireFrom} to ${d.hireTo}`
      : d.hireFrom
        ? `from ${d.hireFrom}`
        : "dates to confirm";

  const itemsSummary = `${
    titles.length ? titles.join("\n") : "No specific categories selected."
  }\n\nHire window: ${window}`;

  const { data: enquiry, error: insErr } = await db
    .from("enquiries")
    .insert({
      name: d.name,
      email: d.email,
      phone: d.phone,
      reason: d.reason,
      categories: d.categories,
      hire_from: d.hireFrom || null,
      hire_to: d.hireTo || null,
      project_start_date: d.hireFrom || null,
      delivery_site: d.location || null,
      notes: d.notes || null,
      items_summary: itemsSummary,
      consent: true,
      source_ip: ip === "unknown" ? null : ip,
      user_agent: h.get("user-agent")?.slice(0, 500) ?? null,
    })
    .select("id,reference,submitted_at")
    .single();

  if (insErr || !enquiry) {
    console.error("quick quote insert failed:", insErr?.message);
    return { ok: false, error: "We couldn't save that. Please phone us on +27 66 429 5788." };
  }

  // Best-effort: the request is already saved, so a mail failure never loses it.
  try {
    await notify(d, titles, window, enquiry.reference, enquiry.submitted_at);
  } catch (e) {
    console.error("quick quote email failed:", e);
  }

  return { ok: true, reference: enquiry.reference };
}

async function notify(
  d: z.infer<typeof Payload>,
  titles: string[],
  window: string,
  reference: string,
  submittedAt: string
) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(`RESEND_API_KEY not set — ${reference} saved but no email sent.`);
    return;
  }
  const { Resend } = await import("resend");
  const resend = new Resend(key);

  const { data } = await supabaseAdmin().from("settings").select("key,value");
  const s = Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? ""]));

  const from = s["enquiry.from_address"] || "enquiries@mail.ecrentals.co.za";
  const replyTo = s["enquiry.reply_to"] || "info@ecrentals.co.za";
  const to = [
    s["enquiry.notify_to"] || "info@ecrentals.co.za",
    s["enquiry.notify_cc"] || "sales@ecrentals.co.za",
  ].filter(Boolean);

  const when = new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Johannesburg",
  }).format(new Date(submittedAt));

  const row = (k: string, v: string) =>
    `<tr><td style="padding:4px 16px 4px 0;color:#6B7280;white-space:nowrap">${esc(k)}</td><td>${v}</td></tr>`;

  const internal = `
  <div style="font-family:Inter,Arial,sans-serif;color:#1C1E21;max-width:660px">
    <div style="background:#0A0A0B;padding:20px 24px">
      <span style="color:#fff;font-weight:800;font-size:18px">EC</span><span style="color:#BA1B20;font-weight:800;font-size:18px"> RENTALS</span>
      <div style="color:#F5A524;font-size:11px;letter-spacing:.14em;margin-top:6px">QUOTATION REQUEST</div>
    </div>
    <div style="padding:24px">
      <table style="font-size:14px;margin-bottom:22px">
        ${row("REFERENCE", `<b>${esc(reference)}</b>`)}
        ${row("SUBMITTED", `${esc(when)} SAST`)}
        ${row("REASON", esc(d.reason))}
      </table>
      <h3 style="font-size:12px;letter-spacing:.14em;color:#6B7280;margin:0 0 8px">EQUIPMENT REQUESTED</h3>
      ${
        titles.length
          ? `<ul style="font-size:14px;margin:0 0 22px;padding-left:18px">${titles
              .map((t) => `<li style="padding:2px 0">${esc(t)}</li>`)
              .join("")}</ul>`
          : `<p style="font-size:14px;margin:0 0 22px;color:#6B7280">No categories ticked — the customer wants a conversation.</p>`
      }
      <h3 style="font-size:12px;letter-spacing:.14em;color:#6B7280;margin:0 0 8px">DETAILS</h3>
      <table style="font-size:14px;margin-bottom:20px">
        ${row("Name", esc(d.name))}
        ${row("Email", `<a href="mailto:${esc(d.email)}">${esc(d.email)}</a>`)}
        ${row("Phone", `<a href="tel:${esc(d.phone)}">${esc(d.phone)}</a>`)}
        ${row("Hire window", esc(window))}
        ${row("Location", esc(d.location || "—"))}
      </table>
      ${
        d.notes
          ? `<h3 style="font-size:12px;letter-spacing:.14em;color:#6B7280;margin:0 0 8px">NOTES</h3><p style="font-size:14px;white-space:pre-wrap;margin:0">${esc(d.notes)}</p>`
          : ""
      }
    </div>
  </div>`;

  await resend.emails.send({
    from: `EC Rentals Enquiries <${from}>`,
    to,
    replyTo: d.email,
    subject: `Quotation Request — ${reference} — ${d.name}`,
    html: internal,
  });

  await resend.emails.send({
    from: `EC Rentals <${from}>`,
    to: [d.email],
    replyTo,
    subject: `We have your request — ${reference}`,
    html: `
    <div style="font-family:Inter,Arial,sans-serif;color:#1C1E21;max-width:600px">
      <div style="background:#0A0A0B;padding:20px 24px">
        <span style="color:#fff;font-weight:800;font-size:18px">EC</span><span style="color:#BA1B20;font-weight:800;font-size:18px"> RENTALS</span>
      </div>
      <div style="padding:24px;font-size:15px;line-height:1.6">
        <p>Thanks ${esc(d.name.split(" ")[0])} — we have your request.</p>
        <p>Your reference is <b>${esc(reference)}</b>. Quote it if you call us.</p>
        <p>We come back within <b>24 hours</b>. Availability is confirmed on quotation.</p>
        <p style="color:#6B7280;font-size:13px;margin-top:22px">
          EC Rentals (Pty) Ltd · Vanderbijlpark<br>+27 66 429 5788 · +27 82 850 4902
        </p>
      </div>
    </div>`,
  });
}
