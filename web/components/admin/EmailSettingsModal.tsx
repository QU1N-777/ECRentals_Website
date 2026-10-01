"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface EmailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function EmailSettingsModal({ isOpen, onClose, onSaved }: EmailSettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [resendApiKey, setResendApiKey] = useState("");
  const [maskedKey, setMaskedKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const [notifyTo, setNotifyTo] = useState("info@ecrentals.co.za");
  const [notifyCc, setNotifyCc] = useState("sales@ecrentals.co.za");
  const [fromAddress, setFromAddress] = useState("enquiries@mail.ecrentals.co.za");
  const [fromName, setFromName] = useState("EC Rentals Enquiries");
  const [autoAckCustomer, setAutoAckCustomer] = useState(true);
  const [enabled, setEnabled] = useState(true);

  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  async function loadSettings() {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/email-settings");
      const data = await res.json();
      if (data?.config) {
        const c = data.config;
        setMaskedKey(c.resendApiKeyMasked || "");
        setHasKey(Boolean(c.hasKey));
        setNotifyTo(c.notifyTo || "info@ecrentals.co.za");
        setNotifyCc(c.notifyCc || "sales@ecrentals.co.za");
        setFromAddress(c.fromAddress || "enquiries@mail.ecrentals.co.za");
        setFromName(c.fromName || "EC Rentals Enquiries");
        setAutoAckCustomer(c.autoAckCustomer !== undefined ? c.autoAckCustomer : true);
        setEnabled(c.enabled !== undefined ? c.enabled : true);
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: "Failed to load settings: " + e.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const payload: any = {
        notifyTo,
        notifyCc,
        fromAddress,
        fromName,
        autoAckCustomer,
        enabled,
      };
      if (resendApiKey.trim()) {
        payload.resendApiKey = resendApiKey.trim();
      }

      const res = await fetch("/api/admin/email-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: "Email automation settings saved successfully." });
        setMaskedKey(data.config.resendApiKeyMasked || "");
        setHasKey(Boolean(data.config.hasKey));
        setResendApiKey("");
        if (onSaved) onSaved();
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to save settings." });
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e.message || "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  }

  async function handleSendTest() {
    setTesting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/email-settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: notifyTo,
          resendApiKey: resendApiKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: "success",
          message: `✓ Test email successfully dispatched to ${notifyTo}! (ID: ${data.id})`,
        });
      } else {
        let msg = data.error || "Failed to dispatch test email.";
        if (data.suggestion) {
          msg += ` — ${data.suggestion}`;
        }
        setFeedback({ type: "error", message: msg });
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e.message || "Test dispatch failed." });
    } finally {
      setTesting(false);
    }
  }

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 620,
          background: "#16181B",
          border: "1px solid #3A3F45",
          borderTop: "3px solid var(--amber)",
          borderRadius: 8,
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.6)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #2A2D32",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>⚙️</span>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, textTransform: "uppercase", color: "#fff", letterSpacing: "0.02em" }}>
                Enquiry Email Automation
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--steel-lift)" }}>
                Configure Resend API credentials and automated team notification recipients.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%",
              width: 30,
              height: 30,
              color: "#fff",
              cursor: "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }}>
          {feedback && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 4,
                fontSize: 13,
                lineHeight: 1.5,
                background:
                  feedback.type === "success"
                    ? "rgba(16, 185, 129, 0.15)"
                    : feedback.type === "error"
                    ? "rgba(239, 68, 68, 0.15)"
                    : "rgba(56, 189, 248, 0.15)",
                border: `1px solid ${
                  feedback.type === "success"
                    ? "rgba(16, 185, 129, 0.4)"
                    : feedback.type === "error"
                    ? "rgba(239, 68, 68, 0.4)"
                    : "rgba(56, 189, 248, 0.4)"
                }`,
                color:
                  feedback.type === "success"
                    ? "#34D399"
                    : feedback.type === "error"
                    ? "#F87171"
                    : "#38BDF8",
              }}
            >
              {feedback.message}
            </div>
          )}

          {/* Resend API Key Field */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Resend API Key
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: hasKey ? "#10B981" : "#F5A524",
                  }}
                />
                <span style={{ fontSize: 11, color: hasKey ? "#34D399" : "#FBBF24", fontWeight: 600 }}>
                  {hasKey ? "Key Configured" : "Key Not Set"}
                </span>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <input
                type={showKey ? "text" : "password"}
                placeholder={hasKey ? `Stored: ${maskedKey} (enter new key to replace)` : "re_xxxxxxxxxxxxxxxxxxxxxxxx"}
                value={resendApiKey}
                onChange={(e) => setResendApiKey(e.target.value)}
                style={{
                  width: "100%",
                  background: "#101113",
                  border: "1px solid #3A3F45",
                  borderRadius: 4,
                  padding: "10px 42px 10px 12px",
                  color: "#fff",
                  fontFamily: "monospace",
                  fontSize: 13,
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--steel-lift)",
                  cursor: "pointer",
                  fontSize: 12,
                  padding: "4px 6px",
                }}
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
            <p style={{ margin: "5px 0 0", fontSize: 11.5, color: "var(--steel-lift)" }}>
              Acquire from <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: "var(--amber)" }}>resend.com/api-keys</a>. Allows live email transmission without server redeployment.
            </p>
          </div>

          {/* Recipients: Primary & CC */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#fff", marginBottom: 6, textTransform: "uppercase" }}>
                Primary Notification (TO)
              </label>
              <input
                type="email"
                value={notifyTo}
                onChange={(e) => setNotifyTo(e.target.value)}
                placeholder="info@ecrentals.co.za"
                required
                style={{
                  width: "100%",
                  background: "#101113",
                  border: "1px solid #3A3F45",
                  borderRadius: 4,
                  padding: "9px 12px",
                  color: "#fff",
                  fontSize: 13,
                }}
              />
              <span style={{ fontSize: 11, color: "var(--steel-lift)", display: "block", marginTop: 4 }}>
                Receives full equipment quotation table.
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#fff", marginBottom: 6, textTransform: "uppercase" }}>
                CC Recipient (Optional)
              </label>
              <input
                type="email"
                value={notifyCc}
                onChange={(e) => setNotifyCc(e.target.value)}
                placeholder="sales@ecrentals.co.za"
                style={{
                  width: "100%",
                  background: "#101113",
                  border: "1px solid #3A3F45",
                  borderRadius: 4,
                  padding: "9px 12px",
                  color: "#fff",
                  fontSize: 13,
                }}
              />
              <span style={{ fontSize: 11, color: "var(--steel-lift)", display: "block", marginTop: 4 }}>
                Copied on every new incoming lead.
              </span>
            </div>
          </div>

          {/* Sender Details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#fff", marginBottom: 6, textTransform: "uppercase" }}>
                From Address
              </label>
              <input
                type="email"
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                placeholder="enquiries@mail.ecrentals.co.za"
                required
                style={{
                  width: "100%",
                  background: "#101113",
                  border: "1px solid #3A3F45",
                  borderRadius: 4,
                  padding: "9px 12px",
                  color: "#fff",
                  fontSize: 13,
                }}
              />
              <span style={{ fontSize: 11, color: "var(--steel-lift)", display: "block", marginTop: 4 }}>
                Must be verified domain in Resend.
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#fff", marginBottom: 6, textTransform: "uppercase" }}>
                Sender Display Name
              </label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="EC Rentals Enquiries"
                style={{
                  width: "100%",
                  background: "#101113",
                  border: "1px solid #3A3F45",
                  borderRadius: 4,
                  padding: "9px 12px",
                  color: "#fff",
                  fontSize: 13,
                }}
              />
            </div>
          </div>

          {/* Toggles */}
          <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: 6, border: "1px solid #2A2D32" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: "#fff" }}>
              <input
                type="checkbox"
                checked={autoAckCustomer}
                onChange={(e) => setAutoAckCustomer(e.target.checked)}
                style={{ accentColor: "var(--amber)" }}
              />
              <span>Send automatic receipt acknowledgement email to the client</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 12,
              borderTop: "1px solid #2A2D32",
              marginTop: 4,
            }}
          >
            <button
              type="button"
              onClick={handleSendTest}
              disabled={testing || (!hasKey && !resendApiKey.trim())}
              className="btn btn--ghost btn--sm"
              style={{
                borderColor: "rgba(255,255,255,0.2)",
                opacity: !hasKey && !resendApiKey.trim() ? 0.5 : 1,
              }}
            >
              {testing ? "Testing..." : "✉️ Send Test Notification"}
            </button>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={onClose} className="btn btn--ghost btn--sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn--primary btn--sm"
                style={{ background: "var(--amber)", color: "#000", fontWeight: 800 }}
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
