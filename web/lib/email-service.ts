import { getFirebaseAdmin } from "@/lib/firebase/server";
import { Resend } from "resend";

export interface EmailConfig {
  resendApiKey: string;
  notifyTo: string;
  notifyCc: string;
  fromAddress: string;
  fromName: string;
  autoAckCustomer: boolean;
  enabled: boolean;
  updatedAt?: string;
}

export const DEFAULT_EMAIL_CONFIG: EmailConfig = {
  resendApiKey: process.env.RESEND_API_KEY || "",
  notifyTo: "info@ecrentals.co.za",
  notifyCc: "sales@ecrentals.co.za",
  fromAddress: "enquiries@mail.ecrentals.co.za",
  fromName: "EC Rentals Enquiries",
  autoAckCustomer: true,
  enabled: true,
};

export async function getEmailConfig(): Promise<EmailConfig> {
  try {
    const { db } = getFirebaseAdmin();
    const doc = await db.collection("site_settings").doc("email").get();
    
    const envKey = process.env.RESEND_API_KEY || "";
    
    if (!doc.exists) {
      return {
        ...DEFAULT_EMAIL_CONFIG,
        resendApiKey: envKey,
      };
    }

    const data = doc.data() as Partial<EmailConfig>;
    return {
      resendApiKey: data.resendApiKey || envKey,
      notifyTo: data.notifyTo || DEFAULT_EMAIL_CONFIG.notifyTo,
      notifyCc: data.notifyCc !== undefined ? data.notifyCc : DEFAULT_EMAIL_CONFIG.notifyCc,
      fromAddress: data.fromAddress || DEFAULT_EMAIL_CONFIG.fromAddress,
      fromName: data.fromName || DEFAULT_EMAIL_CONFIG.fromName,
      autoAckCustomer: data.autoAckCustomer !== undefined ? data.autoAckCustomer : true,
      enabled: data.enabled !== undefined ? data.enabled : true,
      updatedAt: data.updatedAt,
    };
  } catch (err) {
    console.error("Failed to load email config from Firestore:", err);
    return {
      ...DEFAULT_EMAIL_CONFIG,
      resendApiKey: process.env.RESEND_API_KEY || "",
    };
  }
}

export async function saveEmailConfig(updates: Partial<EmailConfig>): Promise<EmailConfig> {
  const { db } = getFirebaseAdmin();
  const current = await getEmailConfig();
  
  const updated: EmailConfig = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await db.collection("site_settings").doc("email").set(updated, { merge: true });
  return updated;
}

function esc(s: string): string {
  return String(s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

export interface EnquiryNotificationData {
  reference: string;
  name: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  reason?: string | null;
  deliverySite?: string | null;
  projectStartDate?: string | null;
  hireFrom?: string | null;
  hireTo?: string | null;
  notes?: string | null;
  items: Array<{
    title: string;
    qty: number;
    days?: number | null;
    requiredFrom?: string | null;
  }>;
  submittedAt: string;
}

export async function sendEnquiryNotification(d: EnquiryNotificationData): Promise<{
  success: boolean;
  status: "sent" | "no_api_key" | "failed" | "disabled";
  internalId?: string;
  ackId?: string;
  error?: string;
}> {
  const config = await getEmailConfig();

  if (!config.enabled) {
    console.log(`[EmailAutomation] Email notifications are disabled for ${d.reference}`);
    return { success: false, status: "disabled", error: "Email notifications disabled in settings" };
  }

  const apiKey = config.resendApiKey || process.env.RESEND_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    console.warn(`[EmailAutomation] No RESEND_API_KEY available — ${d.reference} saved to database but email not sent.`);
    return {
      success: false,
      status: "no_api_key",
      error: "Resend API key not configured in Admin Settings or Environment",
    };
  }

  const resend = new Resend(apiKey.trim());

  const toList = [config.notifyTo, config.notifyCc].filter(Boolean);
  if (toList.length === 0) {
    toList.push("info@ecrentals.co.za");
  }

  const fromSender = `${config.fromName} <${config.fromAddress}>`;
  const replyTo = d.email;

  const when = new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Johannesburg",
  }).format(new Date(d.submittedAt));

  const itemsRows = d.items.length > 0
    ? d.items
        .map(
          (i) => `<tr>
            <td style="padding:10px 14px;border-bottom:1px solid #2A2D32;color:#fff">${esc(i.title)}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #2A2D32;text-align:right;color:#F5A524;font-weight:700">${i.qty}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #2A2D32;text-align:right;color:#fff">${i.days || 1}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #2A2D32;color:#9CA3AF">${esc(i.requiredFrom || "ASAP")}</td>
          </tr>`
        )
        .join("")
    : `<tr><td colspan="4" style="padding:12px;color:#9CA3AF">General equipment hire enquiry</td></tr>`;

  const internalHtml = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#0D0E10;color:#E5E7EB;padding:32px 20px;line-height:1.6">
    <div style="max-width:640px;margin:0 auto;background:#16181B;border:1px solid #2A2D32;border-radius:8px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.5)">
      <!-- Header -->
      <div style="background:#0F1012;padding:24px 28px;border-bottom:2px solid #BA1B20">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.03em">EC</span>
            <span style="font-size:22px;font-weight:900;color:#BA1B20;letter-spacing:-0.03em"> RENTALS</span>
          </div>
          <div style="background:rgba(245,165,36,0.15);border:1px solid rgba(245,165,36,0.3);color:#F5A524;font-size:11px;font-weight:700;padding:4px 10px;border-radius:4px;text-transform:uppercase;letter-spacing:0.1em">
            New Quote Request
          </div>
        </div>
      </div>

      <!-- Content -->
      <div style="padding:28px">
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr>
            <td style="padding:6px 0;color:#9CA3AF;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;width:140px">Reference</td>
            <td style="padding:6px 0;color:#fff;font-size:16px;font-weight:800;letter-spacing:-0.01em">${esc(d.reference)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#9CA3AF;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">Submitted</td>
            <td style="padding:6px 0;color:#E5E7EB;font-size:14px">${esc(when)} SAST</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#9CA3AF;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">Client / Contact</td>
            <td style="padding:6px 0;color:#fff;font-size:15px;font-weight:700">${esc(d.name)} ${d.company ? `<span style="color:#9CA3AF;font-weight:400">(${esc(d.company)})</span>` : ""}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#9CA3AF;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">Email</td>
            <td style="padding:6px 0"><a href="mailto:${esc(d.email)}" style="color:#38BDF8;text-decoration:none">${esc(d.email)}</a></td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#9CA3AF;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">Phone</td>
            <td style="padding:6px 0"><a href="tel:${esc(d.phone || "")}" style="color:#38BDF8;text-decoration:none">${esc(d.phone || "—")}</a></td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#9CA3AF;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">Delivery Site</td>
            <td style="padding:6px 0;color:#E5E7EB;font-size:14px">${esc(d.deliverySite || "Vanderbijlpark / Gauteng")}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#9CA3AF;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">Enquiry Reason</td>
            <td style="padding:6px 0;color:#E5E7EB;font-size:14px">${esc(d.reason || "Plant & Tool Hire")}</td>
          </tr>
        </table>

        <!-- Requested Items -->
        <div style="margin-bottom:24px">
          <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#F5A524;margin-bottom:10px">
            Requested Machinery &amp; Tools (${d.items.length})
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:13.5px;background:#111315;border:1px solid #2A2D32;border-radius:6px;overflow:hidden">
            <thead>
              <tr style="background:#181A1D;color:#9CA3AF;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.06em">
                <th style="padding:10px 14px">Item</th>
                <th style="padding:10px 14px;text-align:right">Qty</th>
                <th style="padding:10px 14px;text-align:right">Days</th>
                <th style="padding:10px 14px">Required From</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
        </div>

        ${d.notes ? `
        <div style="background:#111315;border-left:3px solid #F5A524;padding:14px 18px;margin-bottom:24px;border-radius:0 4px 4px 0">
          <div style="font-size:11px;font-weight:700;color:#F5A524;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">Client Notes / Specifications</div>
          <div style="color:#D1D5DB;font-size:13.5px;white-space:pre-wrap">${esc(d.notes)}</div>
        </div>` : ""}

        <div style="text-align:center;padding-top:12px">
          <a href="mailto:${esc(d.email)}?subject=EC%20Rentals%20Quote%20—%20${encodeURIComponent(d.reference)}" 
             style="display:inline-block;background:linear-gradient(135deg,#BA1B20 0%,#8E1317 100%);color:#fff;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:4px;font-size:14px;text-transform:uppercase;letter-spacing:0.06em">
            Reply to Customer
          </a>
        </div>
      </div>
    </div>
  </div>`;

  let internalId: string | undefined;
  let ackId: string | undefined;

  try {
    const internalRes = await resend.emails.send({
      from: fromSender,
      to: toList,
      replyTo: d.email,
      subject: `New Hire Enquiry [${d.reference}] — ${d.company || d.name}`,
      html: internalHtml,
    });

    if (internalRes.error) {
      console.error("[EmailAutomation] Internal email dispatch failed:", internalRes.error);
      return {
        success: false,
        status: "failed",
        error: internalRes.error.message,
      };
    }

    internalId = internalRes.data?.id;

    // Customer Acknowledgement Email
    if (config.autoAckCustomer && d.email) {
      const ackHtml = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#0D0E10;color:#E5E7EB;padding:32px 20px;line-height:1.6">
        <div style="max-width:600px;margin:0 auto;background:#16181B;border:1px solid #2A2D32;border-radius:8px;overflow:hidden">
          <div style="background:#0F1012;padding:24px 28px;border-bottom:2px solid #BA1B20">
            <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.03em">EC</span>
            <span style="font-size:22px;font-weight:900;color:#BA1B20;letter-spacing:-0.03em"> RENTALS</span>
          </div>
          <div style="padding:28px">
            <p style="font-size:16px;color:#fff;margin-top:0">Thanks <b>${esc(d.name.split(" ")[0])}</b> — we have received your hire enquiry.</p>
            <p style="color:#D1D5DB;font-size:14.5px">
              Your official tracking reference is <b style="color:#F5A524">${esc(d.reference)}</b>. Please quote this reference if you phone our yard or respond via WhatsApp.
            </p>
            <p style="color:#D1D5DB;font-size:14.5px">
              Our hire desk is currently verifying fleet availability and schedule. We will revert with formal rates and quotation within <b>24 hours</b>.
            </p>
            <div style="margin:24px 0">
              <table style="width:100%;border-collapse:collapse;font-size:13.5px;background:#111315;border:1px solid #2A2D32;border-radius:6px;overflow:hidden">
                <thead>
                  <tr style="background:#181A1D;color:#9CA3AF;text-align:left;font-size:11px;text-transform:uppercase">
                    <th style="padding:10px 14px">Item</th>
                    <th style="padding:10px 14px;text-align:right">Qty</th>
                    <th style="padding:10px 14px;text-align:right">Days</th>
                  </tr>
                </thead>
                <tbody>
                  ${d.items.map(i => `<tr>
                    <td style="padding:9px 14px;border-bottom:1px solid #2A2D32;color:#fff">${esc(i.title)}</td>
                    <td style="padding:9px 14px;border-bottom:1px solid #2A2D32;text-align:right;color:#F5A524">${i.qty}</td>
                    <td style="padding:9px 14px;border-bottom:1px solid #2A2D32;text-align:right;color:#fff">${i.days || 1}</td>
                  </tr>`).join("")}
                </tbody>
              </table>
            </div>
            <p style="color:#9CA3AF;font-size:12.5px;border-top:1px solid #2A2D32;padding-top:16px;margin-bottom:0">
              EC Rentals (Pty) Ltd · Lead EPC Building, Cnr Hertz &amp; Becquerel Street, Vanderbijlpark<br>
              Phone: +27 66 429 5788 · +27 82 850 4902 · Email: info@ecrentals.co.za
            </p>
          </div>
        </div>
      </div>`;

      const ackRes = await resend.emails.send({
        from: fromSender,
        to: [d.email],
        replyTo: config.notifyTo,
        subject: `We have received your enquiry — ${d.reference}`,
        html: ackHtml,
      });

      ackId = ackRes.data?.id;
    }

    return {
      success: true,
      status: "sent",
      internalId,
      ackId,
    };
  } catch (err: any) {
    console.error("[EmailAutomation] Unexpected dispatch error:", err);
    return {
      success: false,
      status: "failed",
      error: err.message || "Failed to dispatch email via Resend",
    };
  }
}
