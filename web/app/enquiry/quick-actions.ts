"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { getFirebaseAdmin } from "@/lib/firebase/server";
import { sendEnquiryNotification } from "@/lib/email-service";

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

  const { db } = getFirebaseAdmin();

  let titles: string[] = [];
  if (d.categories.length) {
    const snap = await db.collection("equipment_categories")
      .where("slug", "in", d.categories)
      .get();
      
    const map = new Map(snap.docs.map((c) => [c.data().slug, c.data().title]));
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

  try {
    const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Africa/Johannesburg" })
      .format(new Date())
      .replace(/-/g, "");
    
    const counterRef = db.collection("counters").doc(`enquiries_${today}`);
    let seq = 1;
    await db.runTransaction(async (t) => {
      const snap = await t.get(counterRef);
      if (snap.exists) {
        seq = snap.data()?.val + 1;
        t.update(counterRef, { val: seq });
      } else {
        t.set(counterRef, { val: 1 });
      }
    });

    const reference = `ECR-ENQ-${today}-${String(seq).padStart(4, "0")}`;
    const submitted_at = new Date().toISOString();

    const enquiryData = {
      reference,
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
      status: "New",
      submitted_at,
      consent: true,
      source_ip: ip === "unknown" ? null : ip,
      user_agent: h.get("user-agent")?.slice(0, 500) ?? null,
      items: [] // empty for quick quotes, they just have categories
    };

    const docRef = await db.collection("enquiries").add(enquiryData);

    const taskId = `tsk-${Date.now()}`;
    await db.collection("logicore_tasks").doc(taskId).set({
      task_id: taskId,
      title: `Quick Quote: ${reference} - ${d.name}`,
      description: `Reason: ${d.reason}\nPhone: ${d.phone}\nEmail: ${d.email}\nNotes: ${d.notes || 'None'}\n\nCategories:\n${itemsSummary}`,
      priority: "Medium",
      status: "To Do",
      assigned_to: "usr-admin",
      created_by: "system_website",
      created_at: submitted_at,
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      progress: 0,
      subtasks: [],
      attachments: [],
      category: "Sales",
      location_ref: "loc-hq"
    });

    try {
      const emailResult = await sendEnquiryNotification({
        reference,
        name: d.name,
        company: null,
        email: d.email,
        phone: d.phone,
        reason: d.reason,
        deliverySite: d.location,
        hireFrom: d.hireFrom,
        hireTo: d.hireTo,
        notes: d.notes,
        items: titles.map((t) => ({
          title: t,
          qty: 1,
          days: 1,
          requiredFrom: window,
        })),
        submittedAt: submitted_at,
      });

      await docRef.update({
        email_status: emailResult.status,
        email_sent_at: emailResult.success ? new Date().toISOString() : null,
        email_error: emailResult.error || null,
        email_id: emailResult.internalId || null,
      });
    } catch (e: any) {
      console.error("quick quote email failed:", e);
      await docRef.update({
        email_status: "failed",
        email_error: e.message || "Failed to dispatch email",
      }).catch(() => {});
    }

    return { ok: true, reference };
  } catch (error: any) {
    console.error("quick quote insert failed:", error.message);
    return { ok: false, error: "We couldn't save that. Please phone us on +27 66 429 5788." };
  }
}
