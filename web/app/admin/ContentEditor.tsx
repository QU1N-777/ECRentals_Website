"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getFirebaseClient } from "@/lib/firebase/client";
import { doc, setDoc } from "firebase/firestore";
import ImagePicker from "@/components/admin/ImagePicker";
import type { SiteContent } from "@/lib/types";

type Row = SiteContent;

interface TabItem {
  id: string;
  label: string;
  icon: string;
  desc: string;
  isProtected?: boolean;
}

const TAB_CONFIG: TabItem[] = [
  { id: "hero", label: "Homepage Hero", icon: "🏠", desc: "Main headline, subtitle, buttons & background banner", isProtected: true },
  { id: "contact", label: "Footer & Contact", icon: "🦶", desc: "Edit footer contact info, physical yard address & operating hours", isProtected: true },
  { id: "banner", label: "Announcement Banner", icon: "📢", desc: "Emergency alert, seasonal shutdown & urgent fleet ticker", isProtected: false },
  { id: "sections", label: "Section Visibility", icon: "🎛️", desc: "Enable or disable homepage marketing sections with 1-click switches", isProtected: false },
  { id: "managed", label: "Managed Solutions", icon: "🚜", desc: "Cross-hire fleet sourcing and heavy machinery solutions", isProtected: false },
  { id: "operators", label: "Operators & Rigging", icon: "👷", desc: "Certified machine operators and rigging personnel copy", isProtected: false },
  { id: "cta", label: "Call to Action", icon: "⚡", desc: "Bottom enquiry banner, value proposition & background photo", isProtected: false },
  { id: "categories", label: "Category Covers", icon: "📂", desc: "Hero photos for all 11 equipment categories", isProtected: true },
  { id: "seo", label: "SEO & Meta", icon: "🌐", desc: "Google search title tags and social meta descriptions", isProtected: true },
];

export default function ContentEditor({ rows }: { rows: Row[] }) {
  const [items, setItems] = useState<Row[]>(rows);
  const [activeTab, setActiveTab] = useState("hero");
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Helper map for fast lookup
  const valMap = useMemo(() => {
    return new Map(items.map((i) => [i.key, i.value ?? ""]));
  }, [items]);

  function edit(key: string, value: string) {
    setItems((prev) => {
      const idx = prev.findIndex((r) => r.key === key);
      if (idx >= 0) {
        return prev.map((r) => (r.key === key ? { ...r, value } : r));
      } else {
        return [
          ...prev,
          {
            key,
            value,
            label: key,
            group_name: "custom",
            kind: "text",
            help: null,
            sort_order: 99,
          },
        ];
      }
    });
    setDirty((prev) => new Set(prev).add(key));
    setMsg(null);
  }

  async function save() {
    if (dirty.size === 0) return;
    setSaving(true);
    setErr(null);
    setMsg(null);

    const changed = items.filter((r) => dirty.has(r.key));
    const { db } = getFirebaseClient();

    try {
      await Promise.all(
        changed.map((r) =>
          setDoc(
            doc(db, "site_content", r.key),
            {
              key: r.key,
              value: r.value,
              label: r.label || r.key,
              group_name: r.group_name || "General",
              kind: r.kind || "text",
              sort_order: r.sort_order || 99,
            },
            { merge: true }
          )
        )
      );
      setDirty(new Set());
      setMsg(
        `Saved ${changed.length} setting${changed.length === 1 ? "" : "s"} successfully! Changes are live immediately.`
      );
    } catch (error: any) {
      setErr(error.message ?? "Some changes did not save.");
    } finally {
      setSaving(false);
    }
  }

  // Filter items per active tab
  const tabItems = useMemo(() => {
    return items.filter((r) => {
      const g = (r.group_name || "").toLowerCase();
      const k = (r.key || "").toLowerCase();

      switch (activeTab) {
        case "hero":
          return g.includes("hero") || k.startsWith("home.hero");
        case "managed":
          return g.includes("managed") || k.startsWith("home.managed");
        case "operators":
          return g.includes("operator") || k.startsWith("home.operators");
        case "cta":
          return g.includes("call to action") || k.startsWith("home.cta") || k === "cta_fleet";
        case "contact":
          return g.includes("contact") || k.startsWith("contact.");
        case "categories":
          return g.includes("category") || k.startsWith("cat.");
        case "seo":
          return g.includes("seo") || k.startsWith("seo.");
        default:
          return true;
      }
    });
  }, [items, activeTab]);

  // Live Hero Preview values
  const heroEyebrow = valMap.get("home.hero.eyebrow") || "EC RENTALS · VANDERBIJLPARK & GAUTENG";
  const heroHeadline = valMap.get("home.hero.headline") || "Transport, Plant, Vehicle &";
  const heroAccent = valMap.get("home.hero.headline_accent") || "Equipment Hire";
  const heroSubline = valMap.get("home.hero.subline") || "Certified. Serviced. On site.";
  const heroCta1 = valMap.get("home.hero.cta_primary") || "Browse Equipment";
  const heroCta2 = valMap.get("home.hero.cta_secondary") || "Request a Quote";
  const heroImg = valMap.get("home.hero.image") || valMap.get("hero_home") || "hero-home.webp";
  const heroImgSrc = heroImg.startsWith("http") ? heroImg : `/media/${heroImg}`;

  // Announcement Banner values
  const bannerEnabled = valMap.get("banner.enabled") === "true";
  const bannerType = (valMap.get("banner.type") as "alert" | "seasonal" | "info") || "alert";
  const bannerText = valMap.get("banner.text") || "";
  const bannerLinkText = valMap.get("banner.link_text") || "";
  const bannerLinkUrl = valMap.get("banner.link_url") || "";

  // Section toggle helpers
  const isSectionOn = (key: string) => valMap.get(key) !== "false";

  // Footer & Contact values
  const footerCompanyName = valMap.get("footer.company_name") || "EC Rentals (Pty) Ltd";
  const contactAddress = valMap.get("contact.address") ?? "Lead EPC Building\nCnr Hertz & Becquerel Street\nVanderbijlpark\nSouth Africa";
  const contactPhone1 = valMap.get("contact.phone_primary") ?? "+27 66 429 5788";
  const contactPhone2 = valMap.get("contact.phone_secondary") ?? "+27 82 850 4902";
  const contactWhatsapp = valMap.get("contact.whatsapp") ?? "+27 66 429 5788";
  const contactEmailSales = valMap.get("contact.email_sales") ?? "sales@ecrentals.co.za";
  const contactEmailInfo = valMap.get("contact.email_info") ?? "info@ecrentals.co.za";
  const contactHours = valMap.get("contact.hours") ?? "Mon – Fri: 07:00 – 17:00\n24/7 Breakdown Dispatch";
  const footerLegal = valMap.get("footer.legal_notice") ?? `© ${new Date().getFullYear()} ${footerCompanyName}. Heavy Plant, Crane Truck & Operator Hire across South Africa.`;
  const footerBlurb = valMap.get("footer.blurb") ?? "Delivering heavy plant hire, crane trucks and certified operators across Gauteng, Vaal Triangle and nationwide.";

  return (
    <>
      <div className="adm__head">
        <div>
          <h1>Website Content Editor</h1>
          <p>
            Easily customize hero headlines, announcement banners, toggle page sections on/off, and
            update photos across the site — just like Wix.
          </p>
        </div>
        <div className="adm__save">
          <Link href="/" target="_blank" className="btn btn--ghost" title="Open live website in new tab">
            View Live Site ↗
          </Link>
          {dirty.size > 0 && <span className="adm__dirty">{dirty.size} unsaved</span>}
          <button
            className="btn btn--primary"
            onClick={save}
            disabled={saving || dirty.size === 0}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {msg && <p className="adm__ok" role="status">{msg}</p>}
      {err && <p className="formerr" role="alert">{err}</p>}

      {/* Compact Glass Navigation Bar */}
      <div className="compact-glass-nav" role="tablist" aria-label="Website Content Sections">
        {TAB_CONFIG.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`compact-glass-btn ${isActive ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={isActive}
            >
              <span className="compact-glass-btn__icon">{tab.icon}</span>
              <span className="compact-glass-btn__label">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: HOMEPAGE HERO                                           */}
      {/* ============================================================== */}
      {activeTab === "hero" && (
        <>
          <div className="adm__live-preview">
            <div className="adm__live-badge">Live Hero Preview (Auto-Updates)</div>
            <div
              className="adm__hero-canvas"
              style={{
                backgroundImage: `linear-gradient(90deg, rgba(10,10,11,0.85) 0%, rgba(10,10,11,0.4) 50%, rgba(10,10,11,0.7) 100%), url(${heroImgSrc})`,
              }}
            >
              <div className="adm__hero-content">
                <span className="eyebrow" style={{ color: "var(--amber)", fontSize: 11 }}>
                  {heroEyebrow}
                </span>
                <h2 className="adm__hero-title">
                  {heroHeadline}{" "}
                  <span
                    style={{
                      background: "var(--grad)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {heroAccent}
                  </span>
                </h2>
                <p className="adm__hero-sub">{heroSubline}</p>
                <div className="adm__hero-btns">
                  <span className="btn btn--primary" style={{ padding: "8px 18px", fontSize: 11 }}>
                    {heroCta1}
                  </span>
                  <span className="btn btn--ghost" style={{ padding: "8px 18px", fontSize: 11 }}>
                    {heroCta2}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="adm__fields">
            {tabItems.map((r) => (
              <div className={`afield${dirty.has(r.key) ? " is-dirty" : ""}`} key={r.key}>
                <label>
                  <span className="afield__label">{r.label}</span>
                  <span className="afield__key">{r.key}</span>
                </label>
                {r.kind === "image" ? (
                  <ImagePicker value={r.value ?? ""} onChange={(v) => edit(r.key, v)} />
                ) : r.kind === "richtext" ? (
                  <textarea
                    rows={4}
                    value={r.value ?? ""}
                    onChange={(e) => edit(r.key, e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    value={r.value ?? ""}
                    onChange={(e) => edit(r.key, e.target.value)}
                  />
                )}
                {r.help && <p className="afield__help">{r.help}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* TAB 2: EMERGENCY ALERT & SEASONAL ANNOUNCEMENT BANNER           */}
      {/* ============================================================== */}
      {activeTab === "banner" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Live Interactive Banner Preview */}
          <div>
            <span className="afield__label" style={{ display: "block", marginBottom: 8 }}>
              Live Ticker Preview (Displays at very top of website)
            </span>
            <div
              className={`ann-banner ann-banner--${bannerType}`}
              style={{ borderRadius: 6, overflow: "hidden" }}
            >
              <div className="ann-banner__wrap" style={{ padding: "12px 20px" }}>
                <div className="ann-banner__content">
                  <span className="ann-banner__badge">
                    <span className="ann-banner__icon">
                      {bannerType === "alert" ? "🚨" : bannerType === "seasonal" ? "✨" : "📢"}
                    </span>
                    <span className="ann-banner__type-label">
                      {bannerType === "alert"
                        ? "URGENT NOTICE"
                        : bannerType === "seasonal"
                        ? "SEASONAL UPDATE"
                        : "FLEET ANNOUNCEMENT"}
                    </span>
                  </span>
                  <span className="ann-banner__text">
                    {bannerText || "Enter announcement message below to preview live ticker…"}
                  </span>
                  {bannerLinkText && (
                    <span className="ann-banner__link">
                      <span>{bannerLinkText}</span> ↗
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 13, opacity: 0.7 }}>✕</span>
              </div>
            </div>
          </div>

          {/* Banner Controls Form */}
          <div className="adm__fields" style={{ gridTemplateColumns: "1fr" }}>
            <div className={`afield${dirty.has("banner.enabled") ? " is-dirty" : ""}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#fff" }}>
                    Enable Top Announcement Bar
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--steel-lift)" }}>
                    When enabled, this bar renders above the navigation header on every page of the website.
                  </p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={bannerEnabled}
                    onChange={(e) => edit("banner.enabled", e.target.checked ? "true" : "false")}
                  />
                  <span className="toggle-switch__slider" />
                </label>
              </div>
            </div>

            <div className="afield">
              <label>
                <span className="afield__label">Banner Theme / Severity</span>
              </label>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
                {[
                  { id: "alert", label: "🚨 Emergency / Weather Alert (Red)", desc: "Crimson gradient for severe weather, port delays or urgent notices." },
                  { id: "seasonal", label: "✨ Seasonal / Holiday Notice (Amber)", desc: "Warm amber gold for Christmas shutdown, Easter hours & promotions." },
                  { id: "info", label: "📢 Fleet & Yard Announcement (Steel)", desc: "Sleek dark steel for new machinery arrivals and operational updates." },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => edit("banner.type", t.id)}
                    style={{
                      flex: "1 1 240px",
                      background: bannerType === t.id ? "rgba(245,165,36,0.15)" : "var(--char2)",
                      border: `1.5px solid ${bannerType === t.id ? "var(--amber)" : "#3A3F45"}`,
                      borderRadius: 4,
                      padding: "12px 14px",
                      color: "#fff",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>{t.label}</div>
                    <div style={{ fontSize: 11.5, color: "var(--steel-lift)", lineHeight: 1.4 }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className={`afield${dirty.has("banner.text") ? " is-dirty" : ""}`}>
              <label>
                <span className="afield__label">Announcement Message Text</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. 🚨 High winds forecast across Vaal & Gauteng — Crane operations on yellow standby. Contact dispatch for updates."
                value={bannerText}
                onChange={(e) => edit("banner.text", e.target.value)}
              />
              <p className="afield__help">Keep it under 140 characters for best display on mobile screens.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className={`afield${dirty.has("banner.link_text") ? " is-dirty" : ""}`}>
                <label>
                  <span className="afield__label">Action Button Label (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call Dispatch or View Notice"
                  value={bannerLinkText}
                  onChange={(e) => edit("banner.link_text", e.target.value)}
                />
              </div>

              <div className={`afield${dirty.has("banner.link_url") ? " is-dirty" : ""}`}>
                <label>
                  <span className="afield__label">Action Link URL / Tel (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. /contact or tel:0169860170"
                  value={bannerLinkUrl}
                  onChange={(e) => edit("banner.link_url", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SECTION VISIBILITY TOGGLE SWITCHES                      */}
      {/* ============================================================== */}
      {activeTab === "sections" && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, color: "#fff", textTransform: "uppercase", marginBottom: 6 }}>
              Homepage Marketing Section Controls
            </h2>
            <p style={{ margin: 0, color: "var(--steel-lift)", fontSize: 14 }}>
              Turn off or hide specific marketing sections on the homepage at any time. Changes take
              effect as soon as you click <b>Save Changes</b>.
            </p>
          </div>

          <div className="section-toggle-grid">
            {/* Toggleable Section 1: Trust Band */}
            <div className="section-toggle-card">
              <div className="section-toggle-info">
                <h3>🛡️ Trust &amp; Credibility Band</h3>
                <p>Highlights "Vanderbijlpark-based · Nationwide delivery · 24-hour turnaround".</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isSectionOn("home.section.trust.enabled")}
                  onChange={(e) => edit("home.section.trust.enabled", e.target.checked ? "true" : "false")}
                />
                <span className="toggle-switch__slider" />
              </label>
            </div>

            {/* Toggleable Section 2: Featured Fleet */}
            <div className="section-toggle-card">
              <div className="section-toggle-info">
                <h3>⭐ Featured Machinery Showcase</h3>
                <p>Displays starred priority fleet units directly under the hero banner.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isSectionOn("home.section.featured.enabled")}
                  onChange={(e) => edit("home.section.featured.enabled", e.target.checked ? "true" : "false")}
                />
                <span className="toggle-switch__slider" />
              </label>
            </div>

            {/* Toggleable Section 3: Capability Pillars */}
            <div className="section-toggle-card">
              <div className="section-toggle-info">
                <h3>🏗️ Why EC Rentals Pillars</h3>
                <p>Presents the 3 pillars: Uptime, Compliance, and Single Partner guarantees.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isSectionOn("home.section.pillars.enabled")}
                  onChange={(e) => edit("home.section.pillars.enabled", e.target.checked ? "true" : "false")}
                />
                <span className="toggle-switch__slider" />
              </label>
            </div>

            {/* Toggleable Section 4: Managed Solutions */}
            <div className="section-toggle-card">
              <div className="section-toggle-info">
                <h3>🚜 Managed Hire Solutions</h3>
                <p>"Don't see it? We'll source it" cross-hire and specialized machine sourcing.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isSectionOn("home.section.managed.enabled")}
                  onChange={(e) => edit("home.section.managed.enabled", e.target.checked ? "true" : "false")}
                />
                <span className="toggle-switch__slider" />
              </label>
            </div>

            {/* Toggleable Section 5: Sectors & Industries */}
            <div className="section-toggle-card">
              <div className="section-toggle-info">
                <h3>🏭 Sectors &amp; Industries</h3>
                <p>Grid for Mining, Power &amp; Energy, Petrochemical, Steel, Renewables &amp; Civils.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isSectionOn("home.section.industries.enabled")}
                  onChange={(e) => edit("home.section.industries.enabled", e.target.checked ? "true" : "false")}
                />
                <span className="toggle-switch__slider" />
              </label>
            </div>

            {/* Toggleable Section 6: Operators & Rigging */}
            <div className="section-toggle-card">
              <div className="section-toggle-info">
                <h3>👷 Operators &amp; Site Services</h3>
                <p>"The machine is half the job" operator placement and site service copy.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isSectionOn("home.section.operators.enabled")}
                  onChange={(e) => edit("home.section.operators.enabled", e.target.checked ? "true" : "false")}
                />
                <span className="toggle-switch__slider" />
              </label>
            </div>

            {/* Toggleable Section 7: Tool Teaser */}
            <div className="section-toggle-card">
              <div className="section-toggle-info">
                <h3>🧰 Tool Hire Teaser</h3>
                <p>Summary of tools in stock and tool category chips on the homepage.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isSectionOn("home.section.tools.enabled")}
                  onChange={(e) => edit("home.section.tools.enabled", e.target.checked ? "true" : "false")}
                />
                <span className="toggle-switch__slider" />
              </label>
            </div>

            {/* Toggleable Section 8: Call to Action */}
            <div className="section-toggle-card">
              <div className="section-toggle-info">
                <h3>⚡ Bottom Call to Action Banner</h3>
                <p>Full-width enquiry banner with background image and quote button.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isSectionOn("home.section.cta.enabled")}
                  onChange={(e) => edit("home.section.cta.enabled", e.target.checked ? "true" : "false")}
                />
                <span className="toggle-switch__slider" />
              </label>
            </div>
          </div>

          {/* Protected Core Sections Notice */}
          <div
            style={{
              marginTop: 32,
              background: "rgba(10, 10, 11, 0.6)",
              border: "1px solid #2a2d34",
              borderRadius: 6,
              padding: "20px 24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>🔒</span>
              <h3 style={{ margin: 0, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--amber)" }}>
                Protected Core Sections (Cannot be disabled)
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--steel-lift)", lineHeight: 1.5 }}>
              Per website architecture requirements, the <b>Homepage Hero</b>, <b>Fleet Categories Catalogue</b>, <b>Contact &amp; Yard Details</b>, and <b>SEO Metadata</b> are permanently enabled to guarantee brand discovery and search engine indexation.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: FOOTER & CONTACT INFO (Dedicated Wix-Style Editor)        */}
      {/* ============================================================== */}
      {activeTab === "contact" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Live Interactive Footer Preview */}
          <div className="adm__live-preview">
            <div className="adm__live-badge">Live Footer Preview (Auto-Updates)</div>
            <div className="adm__footer-preview-canvas">
              <div className="adm__footer-preview-grid">
                <div>
                  <h4>Equipment</h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, opacity: 0.6, fontSize: 13, lineHeight: 1.8 }}>
                    <li>Cranes, Trucks &amp; Logistics</li>
                    <li>Earthmoving &amp; Excavators</li>
                    <li>Telehandlers &amp; Access</li>
                    <li>Site Power &amp; Generators</li>
                  </ul>
                </div>
                <div>
                  <h4>Services</h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, opacity: 0.6, fontSize: 13, lineHeight: 1.8 }}>
                    <li>Plant Hire</li>
                    <li>Certified Operator Supply</li>
                    <li>Site Establishment</li>
                    <li>Transport &amp; Logistics</li>
                  </ul>
                </div>
                <div>
                  <h4>Company</h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, opacity: 0.6, fontSize: 13, lineHeight: 1.8 }}>
                    <li>About EC Rentals</li>
                    <li>Safety &amp; Compliance</li>
                    <li>Our Team</li>
                    <li>Terms of Hire</li>
                  </ul>
                </div>
                <div>
                  <h4>Contact &amp; Yard</h4>
                  <address style={{ fontStyle: "normal", fontSize: 13.5 }}>
                    <strong style={{ color: "#fff", display: "block", marginBottom: 6, fontSize: 15 }}>
                      {footerCompanyName}
                    </strong>
                    <div style={{ whiteSpace: "pre-line", color: "#cbd5e1", lineHeight: 1.6, marginBottom: 14 }}>
                      {contactAddress}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6, color: "var(--steel-lift)", fontSize: 13 }}>
                      <div>📞 {contactPhone1}</div>
                      <div>🚨 {contactPhone2} <span style={{ color: "var(--amber)", fontSize: 11 }}>(24/7)</span></div>
                      {contactWhatsapp && (
                        <div>💬 {contactWhatsapp} <span style={{ color: "#22c55e", fontSize: 11 }}>(WhatsApp)</span></div>
                      )}
                      <div>💼 {contactEmailSales}</div>
                      <div>✉️ {contactEmailInfo}</div>
                    </div>

                    {contactHours && (
                      <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 12, color: "#94a3b8" }}>
                        <strong style={{ color: "var(--amber)", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.06em", display: "block", marginBottom: 4 }}>
                          Yard &amp; Dispatch Hours:
                        </strong>
                        <div style={{ whiteSpace: "pre-line", lineHeight: 1.5 }}>{contactHours}</div>
                      </div>
                    )}
                  </address>
                </div>
              </div>

              {footerBlurb && (
                <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 13, color: "#64748b", maxWidth: "60ch" }}>
                  <p style={{ margin: 0 }}>{footerBlurb}</p>
                </div>
              )}

              <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 12.5, color: "#64748b", whiteSpace: "pre-line" }}>
                {footerLegal}
              </div>
            </div>
          </div>

          {/* Form Fields: Footer & Contact Controls */}
          <div className="adm__fields" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))" }}>
            {/* Company Legal Name */}
            <div className={`afield${dirty.has("footer.company_name") ? " is-dirty" : ""}`}>
              <label>
                <span className="afield__label">Company Trading / Legal Name</span>
                <span className="afield__key">footer.company_name</span>
              </label>
              <input
                type="text"
                value={footerCompanyName}
                onChange={(e) => edit("footer.company_name", e.target.value)}
                placeholder="EC Rentals (Pty) Ltd"
              />
              <p className="afield__help">Header name shown on top of the contact details in the footer.</p>
            </div>

            {/* Sales Quotations Email */}
            <div className={`afield${dirty.has("contact.email_sales") ? " is-dirty" : ""}`}>
              <label>
                <span className="afield__label">Sales &amp; Hire Quotations Email</span>
                <span className="afield__key">contact.email_sales</span>
              </label>
              <input
                type="email"
                value={contactEmailSales}
                onChange={(e) => edit("contact.email_sales", e.target.value)}
                placeholder="sales@ecrentals.co.za"
              />
              <p className="afield__help">Direct recipient email for hire requests and plant quotes.</p>
            </div>

            {/* General Info Email */}
            <div className={`afield${dirty.has("contact.email_info") ? " is-dirty" : ""}`}>
              <label>
                <span className="afield__label">General Information &amp; Accounts Email</span>
                <span className="afield__key">contact.email_info</span>
              </label>
              <input
                type="email"
                value={contactEmailInfo}
                onChange={(e) => edit("contact.email_info", e.target.value)}
                placeholder="info@ecrentals.co.za"
              />
              <p className="afield__help">Primary operational inbox for inquiries and accounts.</p>
            </div>

            {/* Primary Dispatch Landline */}
            <div className={`afield${dirty.has("contact.phone_primary") ? " is-dirty" : ""}`}>
              <label>
                <span className="afield__label">Primary Dispatch Landline / Telephone</span>
                <span className="afield__key">contact.phone_primary</span>
              </label>
              <input
                type="text"
                value={contactPhone1}
                onChange={(e) => edit("contact.phone_primary", e.target.value)}
                placeholder="+27 66 429 5788"
              />
              <p className="afield__help">Office and yard dispatch switchboard number.</p>
            </div>

            {/* 24/7 Breakdown Hotline */}
            <div className={`afield${dirty.has("contact.phone_secondary") ? " is-dirty" : ""}`}>
              <label>
                <span className="afield__label">24/7 Emergency Breakdown &amp; Dispatch Line</span>
                <span className="afield__key">contact.phone_secondary</span>
              </label>
              <input
                type="text"
                value={contactPhone2}
                onChange={(e) => edit("contact.phone_secondary", e.target.value)}
                placeholder="+27 82 850 4902"
              />
              <p className="afield__help">Urgent machine breakdown and after-hours mobile line.</p>
            </div>

            {/* WhatsApp Number */}
            <div className={`afield${dirty.has("contact.whatsapp") ? " is-dirty" : ""}`}>
              <label>
                <span className="afield__label">WhatsApp Business Direct Number</span>
                <span className="afield__key">contact.whatsapp</span>
              </label>
              <input
                type="text"
                value={contactWhatsapp}
                onChange={(e) => edit("contact.whatsapp", e.target.value)}
                placeholder="+27 66 429 5788"
              />
              <p className="afield__help">Enables 1-click WhatsApp messaging link in the footer.</p>
            </div>

            {/* Physical Address & Yard Location (Long Text Input with Line Breaks) */}
            <div
              className={`afield${dirty.has("contact.address") ? " is-dirty" : ""}`}
              style={{ gridColumn: "1 / -1" }}
            >
              <label>
                <span className="afield__label">📍 Physical Address &amp; Yard Location (Long Text Input)</span>
                <span className="afield__key">contact.address</span>
              </label>
              <textarea
                rows={5}
                value={contactAddress}
                onChange={(e) => edit("contact.address", e.target.value)}
                placeholder={"Lead EPC Building\nCnr Hertz & Becquerel Street\nVanderbijlpark\nSouth Africa"}
                style={{ fontFamily: "inherit", lineHeight: 1.6 }}
              />
              <p className="afield__help">
                <b>💡 Text Position &amp; Formatting Guide:</b> Enter each address element on its own line (e.g. Line 1: Building / Yard Name, Line 2: Street &amp; Corner, Line 3: City &amp; Province, Line 4: Country / Postal Code). All line breaks and text positioning are rendered with exact fidelity on the live website.
              </p>
            </div>

            {/* Operating Hours (Long Text Input) */}
            <div
              className={`afield${dirty.has("contact.hours") ? " is-dirty" : ""}`}
              style={{ gridColumn: "1 / -1" }}
            >
              <label>
                <span className="afield__label">⏰ Yard Operating Hours &amp; Dispatch Schedule</span>
                <span className="afield__key">contact.hours</span>
              </label>
              <textarea
                rows={3}
                value={contactHours}
                onChange={(e) => edit("contact.hours", e.target.value)}
                placeholder={"Monday – Friday: 07:00 – 17:00\n24/7 Emergency Breakdown Dispatch"}
                style={{ fontFamily: "inherit", lineHeight: 1.6 }}
              />
              <p className="afield__help">
                Operating schedule shown in the footer. Use line breaks to separate standard weekday hours from weekend or emergency breakdown availability.
              </p>
            </div>

            {/* Copyright & Legal Notice (Long Text Input) */}
            <div
              className={`afield${dirty.has("footer.legal_notice") ? " is-dirty" : ""}`}
              style={{ gridColumn: "1 / -1" }}
            >
              <label>
                <span className="afield__label">⚖️ Footer Copyright &amp; Legal Notice</span>
                <span className="afield__key">footer.legal_notice</span>
              </label>
              <textarea
                rows={2}
                value={footerLegal}
                onChange={(e) => edit("footer.legal_notice", e.target.value)}
                placeholder="© 2026 EC Rentals (Pty) Ltd. Heavy Plant, Crane Truck & Operator Hire across South Africa."
                style={{ fontFamily: "inherit", lineHeight: 1.6 }}
              />
              <p className="afield__help">
                Displayed in the bottom legal strip alongside POPIA notice and Terms of Hire links.
              </p>
            </div>

            {/* Footer Short Mission Blurb */}
            <div
              className={`afield${dirty.has("footer.blurb") ? " is-dirty" : ""}`}
              style={{ gridColumn: "1 / -1" }}
            >
              <label>
                <span className="afield__label">💡 Footer Tagline / Mission Blurb (Optional)</span>
                <span className="afield__key">footer.blurb</span>
              </label>
              <textarea
                rows={2}
                value={footerBlurb}
                onChange={(e) => edit("footer.blurb", e.target.value)}
                placeholder="Delivering heavy plant hire, crane trucks and certified operators across Gauteng, Vaal Triangle and nationwide."
                style={{ fontFamily: "inherit", lineHeight: 1.6 }}
              />
              <p className="afield__help">
                Optional summary paragraph displayed above the legal strip across all pages.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* OTHER TABS (Managed, Operators, CTA, Categories, SEO)          */}
      {/* ============================================================== */}
      {activeTab !== "hero" && activeTab !== "banner" && activeTab !== "sections" && activeTab !== "contact" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Quick toggle if applicable for this section */}
          {activeTab === "managed" && (
            <div className="section-toggle-card" style={{ marginBottom: 12 }}>
              <div className="section-toggle-info">
                <h3>Active on Homepage</h3>
                <p>Turn this entire Managed Hire section on or off on the homepage.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isSectionOn("home.section.managed.enabled")}
                  onChange={(e) => edit("home.section.managed.enabled", e.target.checked ? "true" : "false")}
                />
                <span className="toggle-switch__slider" />
              </label>
            </div>
          )}

          {activeTab === "operators" && (
            <div className="section-toggle-card" style={{ marginBottom: 12 }}>
              <div className="section-toggle-info">
                <h3>Active on Homepage</h3>
                <p>Turn this entire Operators &amp; Rigging section on or off on the homepage.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isSectionOn("home.section.operators.enabled")}
                  onChange={(e) => edit("home.section.operators.enabled", e.target.checked ? "true" : "false")}
                />
                <span className="toggle-switch__slider" />
              </label>
            </div>
          )}

          {activeTab === "cta" && (
            <div className="section-toggle-card" style={{ marginBottom: 12 }}>
              <div className="section-toggle-info">
                <h3>Active on Homepage</h3>
                <p>Turn this bottom Call-To-Action banner on or off on the homepage.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isSectionOn("home.section.cta.enabled")}
                  onChange={(e) => edit("home.section.cta.enabled", e.target.checked ? "true" : "false")}
                />
                <span className="toggle-switch__slider" />
              </label>
            </div>
          )}

          <div className="adm__fields">
            {tabItems.map((r) => (
              <div className={`afield${dirty.has(r.key) ? " is-dirty" : ""}`} key={r.key}>
                <label>
                  <span className="afield__label">{r.label}</span>
                  <span className="afield__key">{r.key}</span>
                </label>
                {r.kind === "image" ? (
                  <ImagePicker value={r.value ?? ""} onChange={(v) => edit(r.key, v)} />
                ) : r.kind === "richtext" ? (
                  <textarea
                    rows={4}
                    value={r.value ?? ""}
                    onChange={(e) => edit(r.key, e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    value={r.value ?? ""}
                    onChange={(e) => edit(r.key, e.target.value)}
                  />
                )}
                {r.help && <p className="afield__help">{r.help}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
