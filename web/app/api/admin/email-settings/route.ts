import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/firebase/session";
import { getEmailConfig, saveEmailConfig } from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { isAdmin } = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await getEmailConfig();
    const rawKey = config.resendApiKey || "";
    const maskedKey = rawKey.length > 8
      ? `${rawKey.slice(0, 4)}••••••••${rawKey.slice(-4)}`
      : rawKey ? "••••••••" : "";

    return NextResponse.json({
      config: {
        ...config,
        resendApiKeyMasked: maskedKey,
        hasKey: Boolean(rawKey.trim()),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load email settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { isAdmin } = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updates: any = {};

    if (body.resendApiKey !== undefined && body.resendApiKey !== "") {
      updates.resendApiKey = String(body.resendApiKey).trim();
    }
    if (body.notifyTo !== undefined) {
      updates.notifyTo = String(body.notifyTo).trim();
    }
    if (body.notifyCc !== undefined) {
      updates.notifyCc = String(body.notifyCc).trim();
    }
    if (body.fromAddress !== undefined) {
      updates.fromAddress = String(body.fromAddress).trim();
    }
    if (body.fromName !== undefined) {
      updates.fromName = String(body.fromName).trim();
    }
    if (body.autoAckCustomer !== undefined) {
      updates.autoAckCustomer = Boolean(body.autoAckCustomer);
    }
    if (body.enabled !== undefined) {
      updates.enabled = Boolean(body.enabled);
    }

    const saved = await saveEmailConfig(updates);

    const rawKey = saved.resendApiKey || "";
    const maskedKey = rawKey.length > 8
      ? `${rawKey.slice(0, 4)}••••••••${rawKey.slice(-4)}`
      : rawKey ? "••••••••" : "";

    return NextResponse.json({
      success: true,
      config: {
        ...saved,
        resendApiKeyMasked: maskedKey,
        hasKey: Boolean(rawKey.trim()),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save email settings" }, { status: 500 });
  }
}
