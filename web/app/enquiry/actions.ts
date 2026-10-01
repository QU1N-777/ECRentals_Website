"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { getFirebaseAdmin } from "@/lib/firebase/server";
import { sendEnquiryNotification } from "@/lib/email-service";

/**
 * Enquiry submission.
 *
 * Runs server-side with the service role because `enquiries` has no anon
 * policy at all — bots cannot write into a table holding customer contact
 * details. Everything is validated here as well as in the browser; the
 * client is never trusted (plan §7.4).
 */

const Line = z.object({
  equipmentId: z.string().uuid(),
  slug: z.string().max(120),
  title: z.string().min(1).max(200),
  qty: z.number().int().min(1).max(99),
  days: z.number().int().min(1).max(730),
  requiredFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
});

const Payload = z.object({
  name: z.string().trim().min(2, "Please give us a name.").max(120),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.string().trim().email("That email address doesn't look right.").max(160),
  phone: z.string().trim().min(6, "We need a number to call you back on.").max(40),
  deliverySite: z.string().trim().max(200).optional().or(z.literal("")),
  reason: z.string().trim().max(80).optional().or(z.literal("")),
  projectStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
  consent: z.literal(true, {
    errorMap: () => ({ message: "We need your consent to store these details." }),
  }),
  website: z.string().max(0, "Rejected."), // honeypot — real people leave it empty
  items: z.array(Line).min(1, "Your enquiry is empty.").max(60),
});

export type EnquiryResult =
  | { ok: true; reference: string }
  | { ok: false; error: string; field?: string };

/** Crude per-instance rate limit. Backstop only — the honeypot does the real work. */
const seen = new Map<string, number[]>();
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (seen.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  seen.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

const _REASONS_UNUSED = [
  "Quotation", "Heavy Machine Rental", "Vehicle Hire", "Truck Hire", "Tractor Hire",
  "Forklift Hire", "Telehandler & Access Hire", "Crane Hire (Managed)",
  "Plant Operator Supply", "Site Establishment (Containers)",
  "HV Cable Testing & Fault Location", "Solar Piling", "Tool Hire",
  "Long-Term / Project Hire", "Cross-Border Hire", "Careers", "General Enquiry",
] as const;

export async function submitEnquiry(raw: unknown): Promise<EnquiryResult> {
  const parsed = Payload.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first.message, field: String(first.path[0] ?? "") };
  }
  const d = parsed.data;

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return { ok: false, error: "Too many enquiries from this connection. Please call us instead." };
  }

  const { db } = getFirebaseAdmin();

  // Denormalised table for the notification email body.
  const itemsSummary = d.items
    .map((i) => `${i.qty} × ${i.title} — ${i.days} days${i.requiredFrom ? `, from ${i.requiredFrom}` : ""}`)
    .join("\n");

  try {
    // Generate daily reference (e.g. ECR-ENQ-20260928-0001)
    const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Africa/Johannesburg" })
      .format(new Date())
      .replace(/-/g, "");
    
    const counterRef = db.collection("counters").doc(`enquiries_${today}`);
    let seq = 1;
    await db.runTransaction(async (t: any) => {
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
      company: d.company || null,
      email: d.email,
      phone: d.phone,
      delivery_site: d.deliverySite || null,
      reason: d.reason || null,
      project_start_date: d.projectStartDate || null,
      notes: d.notes || null,
      items_summary: itemsSummary,
      status: "New",
      submitted_at,
      consent: true,
      source_ip: ip === "unknown" ? null : ip,
      user_agent: h.get("user-agent")?.slice(0, 500) ?? null,
      items: d.items.map((i) => ({
        equipment_id: i.equipmentId,
        item_title: i.title,
        quantity: i.qty,
        days: i.days,
        required_from: i.requiredFrom,
      }))
    };

    const docRef = await db.collection("enquiries").add(enquiryData);

    // Enquiries-to-Task Integration: Create a LogiCore Task
    const taskId = `tsk-${Date.now()}`;
    await db.collection("logicore_tasks").doc(taskId).set({
      task_id: taskId,
      title: `New Enquiry: ${reference} - ${d.company || d.name}`,
      description: `Reason: ${d.reason || 'Quotation'}\nPhone: ${d.phone}\nEmail: ${d.email}\nNotes: ${d.notes || 'None'}\n\nItems:\n${itemsSummary}`,
      priority: "High",
      status: "To Do",
      assigned_to: "usr-admin", // default assignment
      created_by: "system_website",
      created_at: submitted_at,
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // due 24h
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
        company: d.company,
        email: d.email,
        phone: d.phone,
        reason: d.reason,
        deliverySite: d.deliverySite,
        projectStartDate: d.projectStartDate,
        notes: d.notes,
        items: d.items.map((i) => ({
          title: i.title,
          qty: i.qty,
          days: i.days,
          requiredFrom: i.requiredFrom,
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
      console.error("enquiry email failed:", e);
      await docRef.update({
        email_status: "failed",
        email_error: e.message || "Failed to dispatch email",
      }).catch(() => {});
    }

    return { ok: true, reference };
  } catch (error: any) {
    console.error("enquiry insert failed:", error.message);
    return { ok: false, error: "We couldn't save that. Please phone us on +27 66 429 5788." };
  }
}


