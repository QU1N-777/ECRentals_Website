import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/firebase/session";
import { getEmailConfig } from "@/lib/email-service";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { isAdmin, email: adminEmail } = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const config = await getEmailConfig();

    const apiKey = body.resendApiKey || config.resendApiKey || process.env.RESEND_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json({
        success: false,
        error: "No Resend API Key configured. Please enter your Resend API Key and save settings.",
      }, { status: 400 });
    }

    const to = body.to || config.notifyTo || adminEmail || "info@ecrentals.co.za";
    const from = config.fromAddress || "enquiries@mail.ecrentals.co.za";
    const fromSender = `${config.fromName || "EC Rentals"} <${from}>`;

    const resend = new Resend(apiKey.trim());

    const result = await resend.emails.send({
      from: fromSender,
      to: [to],
      subject: `[Test] EC Rentals Email Automation Test — ${new Date().toLocaleTimeString("en-ZA")}`,
      html: `
        <div style="font-family:sans-serif;max-width:540px;margin:0 auto;background:#16181B;color:#fff;padding:28px;border-radius:8px;border:1px solid #3A3F45">
          <h2 style="color:#F5A524;margin-top:0">EC Rentals Email Automation Active</h2>
          <p style="color:#D1D5DB;font-size:14px">
            This is a test notification confirming that Resend API communication is operational.
          </p>
          <table style="width:100%;font-size:13px;border-collapse:collapse;margin:16px 0">
            <tr><td style="color:#9CA3AF;padding:4px 0">Sender:</td><td>${fromSender}</td></tr>
            <tr><td style="color:#9CA3AF;padding:4px 0">Recipient:</td><td>${to}</td></tr>
            <tr><td style="color:#9CA3AF;padding:4px 0">Timestamp:</td><td>${new Date().toISOString()}</td></tr>
          </table>
          <p style="color:#10B981;font-weight:700;font-size:13px;margin-bottom:0">
            ✓ Automation pipeline is ready to receive customer hire enquiries.
          </p>
        </div>
      `,
    });

    if (result.error) {
      console.error("[EmailTest] Resend test error:", result.error);
      return NextResponse.json({
        success: false,
        error: result.error.message,
        suggestion: result.error.message.includes("domain")
          ? "Ensure your domain 'mail.ecrentals.co.za' is verified in Resend DNS settings. If testing in development sandbox, you can temporarily send from onboarding@resend.dev."
          : undefined,
      }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      id: result.data?.id,
      message: `Test email dispatched successfully to ${to}`,
    });
  } catch (err: any) {
    console.error("[EmailTest] Unexpected error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Failed to dispatch test email",
    }, { status: 500 });
  }
}
