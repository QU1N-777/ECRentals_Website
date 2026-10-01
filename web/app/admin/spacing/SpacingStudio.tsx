"use client";

import { useState, useTransition } from "react";
import {
  DEFAULT_SPACING,
  SPACING_PRESETS,
  type SpacingConfig,
} from "@/lib/spacing";
import { SPACING_STORAGE_KEY, SPACING_CHANGE_EVENT } from "@/components/LayoutSpacingInjector";

interface Props {
  initialConfig: SpacingConfig;
}

export default function SpacingStudio({ initialConfig }: Props) {
  const [config, setConfig] = useState<SpacingConfig>(initialConfig);
  const [history, setHistory] = useState<SpacingConfig[]>([initialConfig]);
  const [savedConfig, setSavedConfig] = useState<SpacingConfig>(initialConfig);
  const [previewTab, setPreviewTab] = useState<"tools" | "home">("tools");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Check if dirty
  const isDirty = JSON.stringify(config) !== JSON.stringify(savedConfig);
  const canUndo = history.length > 1;

  const updateField = (field: keyof SpacingConfig, value: number) => {
    setHistory((prev) => [...prev, config]);
    setConfig((prev) => {
      const next = { ...prev, [field]: value };
      // Broadcast live to window so preview and any open page updates in real-time
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(SPACING_CHANGE_EVENT, { detail: next }));
      }
      return next;
    });
  };

  const applyPreset = (presetKey: string) => {
    const preset = SPACING_PRESETS[presetKey];
    if (!preset) return;
    setHistory((prev) => [...prev, config]);
    setConfig(preset.config);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(SPACING_CHANGE_EVENT, { detail: preset.config }));
    }
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setConfig(previous);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(SPACING_CHANGE_EVENT, { detail: previous }));
    }
  };

  const handleCancel = () => {
    setConfig(savedConfig);
    setHistory([savedConfig]);
    setStatusMsg(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(SPACING_CHANGE_EVENT, { detail: savedConfig }));
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        setStatusMsg(null);
        const res = await fetch("/api/admin/spacing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to save settings");
        }

        setSavedConfig(config);
        setHistory([config]);
        try {
          localStorage.setItem(SPACING_STORAGE_KEY, JSON.stringify(config));
        } catch (e) {}

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(SPACING_CHANGE_EVENT, { detail: config }));
        }

        setStatusMsg({ type: "success", text: "✓ Spacing settings successfully saved to live website!" });
        setTimeout(() => setStatusMsg(null), 4500);
      } catch (err: any) {
        setStatusMsg({ type: "error", text: `Error: ${err.message}` });
      }
    });
  };

  return (
    <div className="spacing-studio">
      {/* Header & Controls Bar */}
      <div className="spacing-studio__topbar">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 className="spacing-studio__title">Manual Layout &amp; Gap Adjustments</h1>
            {isDirty && <span className="spacing-studio__dirty-badge">● Unsaved Changes</span>}
          </div>
          <p className="spacing-studio__subtitle">
            Fine-tune spacing, section gaps, and component margins across the website with real-time visual feedback.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="spacing-studio__actions">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={handleUndo}
            disabled={!canUndo || isPending}
            title="Undo last spacing change"
          >
            ↩ Undo
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={handleCancel}
            disabled={!isDirty || isPending}
            title="Discard unsaved changes and reset"
          >
            ✕ Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={handleSave}
            disabled={!isDirty || isPending}
          >
            {isPending ? "Saving..." : "💾 Save Changes"}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`spacing-studio__alert spacing-studio__alert--${statusMsg.type}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Main Studio Grid: Controls on Left, Live Preview on Right */}
      <div className="spacing-studio__layout">
        {/* Controls Column */}
        <div className="spacing-studio__controls">
          {/* Quick Presets */}
          <div className="spacing-card">
            <h3 className="spacing-card__title">⚡ Layout Rhythm Presets</h3>
            <div className="spacing-presets-grid">
              {Object.entries(SPACING_PRESETS).map(([key, p]) => (
                <button
                  key={key}
                  type="button"
                  className="spacing-preset-btn"
                  onClick={() => applyPreset(key)}
                >
                  <span className="spacing-preset-btn__name">{p.label}</span>
                  <span className="spacing-preset-btn__desc">{p.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tools Page Controls */}
          <div className="spacing-card">
            <div className="spacing-card__header">
              <span className="spacing-card__icon">🔧</span>
              <div>
                <h3 className="spacing-card__title">Tool Section Spacing</h3>
                <p className="spacing-card__desc">Controls gaps between categories, tool families, and search bars.</p>
              </div>
            </div>

            <div className="spacing-controls-list">
              {/* Category Gap */}
              <div className="spacing-slider-group">
                <div className="spacing-slider-label">
                  <span>Category Section Gaps</span>
                  <span className="spacing-val-badge num">{config.toolsCategoryGap}px</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="60"
                  step="2"
                  value={config.toolsCategoryGap}
                  onChange={(e) => updateField("toolsCategoryGap", Number(e.target.value))}
                  className="spacing-slider"
                />
                <span className="spacing-hint">Space between major tool sections (e.g. Hand Tools vs Electrical).</span>
              </div>

              {/* Tool Types Gap */}
              <div className="spacing-slider-group">
                <div className="spacing-slider-label">
                  <span>Sub-Type Family Gap</span>
                  <span className="spacing-val-badge num">{config.toolsGroupGap}px</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="40"
                  step="2"
                  value={config.toolsGroupGap}
                  onChange={(e) => updateField("toolsGroupGap", Number(e.target.value))}
                  className="spacing-slider"
                />
                <span className="spacing-hint">Gap between tool sub-groups inside a category (e.g. Sockets vs Wrenches).</span>
              </div>

              {/* Items Grid Gap */}
              <div className="spacing-slider-group">
                <div className="spacing-slider-label">
                  <span>Tool Cards Grid Gap</span>
                  <span className="spacing-val-badge num">{config.toolsGridGap}px</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="20"
                  step="1"
                  value={config.toolsGridGap}
                  onChange={(e) => updateField("toolsGridGap", Number(e.target.value))}
                  className="spacing-slider"
                />
                <span className="spacing-hint">Spacing between individual tool cards in the grid.</span>
              </div>

              {/* Hero to Search Gap */}
              <div className="spacing-slider-group">
                <div className="spacing-slider-label">
                  <span>Tools Hero / Search Bar Spacing</span>
                  <span className="spacing-val-badge num">{config.toolsHeroGap}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="60"
                  step="2"
                  value={config.toolsHeroGap}
                  onChange={(e) => updateField("toolsHeroGap", Number(e.target.value))}
                  className="spacing-slider"
                />
                <span className="spacing-hint">Padding between the page title lede and the tool search input.</span>
              </div>
            </div>
          </div>

          {/* Page & Section Spacing Controls */}
          <div className="spacing-card">
            <div className="spacing-card__header">
              <span className="spacing-card__icon">📐</span>
              <div>
                <h3 className="spacing-card__title">Site Sections &amp; Card Spacing</h3>
                <p className="spacing-card__desc">Controls overall page rhythm, machinery cards, and callout margins.</p>
              </div>
            </div>

            <div className="spacing-controls-list">
              {/* Global Section Gap */}
              <div className="spacing-slider-group">
                <div className="spacing-slider-label">
                  <span>Global Section Padding</span>
                  <span className="spacing-val-badge num">{config.sectionGap}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="100"
                  step="4"
                  value={config.sectionGap}
                  onChange={(e) => updateField("sectionGap", Number(e.target.value))}
                  className="spacing-slider"
                />
                <span className="spacing-hint">Top &amp; bottom padding for content bands across the site.</span>
              </div>

              {/* Equipment Grid Gap */}
              <div className="spacing-slider-group">
                <div className="spacing-slider-label">
                  <span>Machinery Cards Grid Gap</span>
                  <span className="spacing-val-badge num">{config.cardGridGap}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="2"
                  value={config.cardGridGap}
                  onChange={(e) => updateField("cardGridGap", Number(e.target.value))}
                  className="spacing-slider"
                />
                <span className="spacing-hint">Spacing between plant and equipment cards.</span>
              </div>

              {/* Pagehead Padding */}
              <div className="spacing-slider-group">
                <div className="spacing-slider-label">
                  <span>Page Header Height / Padding</span>
                  <span className="spacing-val-badge num">{config.pageHeadPadding}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="2"
                  value={config.pageHeadPadding}
                  onChange={(e) => updateField("pageHeadPadding", Number(e.target.value))}
                  className="spacing-slider"
                />
                <span className="spacing-hint">Vertical padding inside page headers on category and item pages.</span>
              </div>

              {/* Callout Margin */}
              <div className="spacing-slider-group">
                <div className="spacing-slider-label">
                  <span>Callout Banner Spacing</span>
                  <span className="spacing-val-badge num">{config.calloutMargin}px</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="80"
                  step="4"
                  value={config.calloutMargin}
                  onChange={(e) => updateField("calloutMargin", Number(e.target.value))}
                  className="spacing-slider"
                />
                <span className="spacing-hint">Margin above bottom quotation and contact callout boxes.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="spacing-studio__preview-wrap">
          <div className="spacing-preview-box">
            {/* Preview Toolbar */}
            <div className="spacing-preview-box__bar">
              <div className="spacing-preview-tabs">
                <button
                  type="button"
                  className={`spacing-preview-tab${previewTab === "tools" ? " is-active" : ""}`}
                  onClick={() => setPreviewTab("tools")}
                >
                  🔧 Tools Catalogue
                </button>
                <button
                  type="button"
                  className={`spacing-preview-tab${previewTab === "home" ? " is-active" : ""}`}
                  onClick={() => setPreviewTab("home")}
                >
                  🚜 Machinery Fleet &amp; Cards
                </button>
              </div>

              <div className="spacing-device-toggles">
                <button
                  type="button"
                  className={`spacing-dev-btn${previewDevice === "desktop" ? " is-active" : ""}`}
                  onClick={() => setPreviewDevice("desktop")}
                  title="Desktop (100%)"
                >
                  🖥️ Full
                </button>
                <button
                  type="button"
                  className={`spacing-dev-btn${previewDevice === "tablet" ? " is-active" : ""}`}
                  onClick={() => setPreviewDevice("tablet")}
                  title="Tablet (768px)"
                >
                  📱 Tablet
                </button>
                <button
                  type="button"
                  className={`spacing-dev-btn${previewDevice === "mobile" ? " is-active" : ""}`}
                  onClick={() => setPreviewDevice("mobile")}
                  title="Mobile (420px)"
                >
                  📱 Mobile
                </button>
              </div>
            </div>

            {/* Preview Canvas */}
            <div className="spacing-preview-viewport">
              <div
                className={`spacing-preview-stage spacing-preview-stage--${previewDevice}`}
                style={
                  {
                    "--spacing-tools-cat-gap": `${config.toolsCategoryGap}px`,
                    "--spacing-tools-group-gap": `${config.toolsGroupGap}px`,
                    "--spacing-tools-grid-gap": `${config.toolsGridGap}px`,
                    "--spacing-tools-hero-gap": `${config.toolsHeroGap}px`,
                    "--spacing-section-gap": `${config.sectionGap}px`,
                    "--spacing-grid-gap": `${config.cardGridGap}px`,
                    "--spacing-pagehead-gap": `${config.pageHeadPadding}px`,
                    "--spacing-hero-gap": `${config.heroBottomGap}px`,
                    "--spacing-callout-gap": `${config.calloutMargin}px`,
                  } as React.CSSProperties
                }
              >
                {previewTab === "tools" ? (
                  <div className="mini-tools-preview">
                    {/* Simulated Pagehead */}
                    <div
                      className="mini-pagehead"
                      style={{ paddingBlock: `${config.pageHeadPadding}px 14px` }}
                    >
                      <div className="mini-rule" />
                      <span className="mini-eyebrow">Tool Hire</span>
                      <h2 className="mini-title">149 Tools in Stock</h2>
                      <p className="mini-lede">A complete, granular tool catalogue searchable for site hire.</p>
                    </div>

                    {/* Gap Indicator Ruler 1 */}
                    <div className="mini-ruler" style={{ height: `${config.toolsHeroGap}px` }}>
                      <span className="mini-ruler__line" />
                      <span className="mini-ruler__tag">Hero to Search: {config.toolsHeroGap}px</span>
                      <span className="mini-ruler__line" />
                    </div>

                    {/* Simulated Search & Filter bar */}
                    <div className="mini-search">
                      <span className="mini-search__icon">🔍</span>
                      <span className="mini-search__placeholder">Search 149 tools...</span>
                    </div>

                    <div className="mini-pills">
                      <span className="mini-pill mini-pill--amber is-active">All Tools (149)</span>
                      <span className="mini-pill mini-pill--hand">🔧 Hand Tools (57)</span>
                      <span className="mini-pill mini-pill--elec">⚡ Electrical (29)</span>
                      <span className="mini-pill mini-pill--power">🔌 Power Tools (27)</span>
                      <span className="mini-pill mini-pill--pipe">🚰 Hydraulics (10)</span>
                    </div>

                    {/* Category 1: Hand Tools */}
                    <div
                      className="mini-cat-card"
                      style={{
                        marginBottom: `${config.toolsCategoryGap}px`,
                        borderLeftColor: "#F59E0B",
                      }}
                    >
                      <div
                        className="mini-cat-header"
                        style={{
                          background: "linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, #151619 100%)",
                          borderLeftColor: "#F59E0B",
                        }}
                      >
                        <div className="mini-cat-info">
                          <span>🔧</span>
                          <div>
                            <b>Hand Tools &amp; Workshop</b>
                            <small>Mechanics, wrenches, sockets, and heavy-duty manual assembly tools.</small>
                          </div>
                        </div>
                        <span className="mini-cat-badge" style={{ color: "#FBBF24" }}>57 Tools</span>
                      </div>

                      <div className="mini-cat-body" style={{ gap: `${config.toolsGroupGap}px` }}>
                        <div className="mini-group">
                          <div className="mini-group-head">
                            <span className="mini-group-dot" style={{ background: "#F59E0B" }} />
                            <b>Wrenches &amp; Spanners (24)</b>
                          </div>
                          <div className="mini-grid" style={{ gap: `${config.toolsGridGap}px` }}>
                            <div className="mini-item">
                              <span>Torque Wrench 1/2&quot;</span>
                              <button className="mini-btn">+ Add</button>
                            </div>
                            <div className="mini-item">
                              <span>Spanner Open Jaw Set</span>
                              <button className="mini-btn">+ Add</button>
                            </div>
                            <div className="mini-item">
                              <span>Wrench - Slogging 65mm</span>
                              <button className="mini-btn is-added">✓ In Enquiry</button>
                            </div>
                          </div>
                        </div>

                        {/* Gap Indicator Ruler 2 */}
                        <div className="mini-ruler" style={{ height: `${config.toolsGroupGap}px` }}>
                          <span className="mini-ruler__line" />
                          <span className="mini-ruler__tag">Tool Family Gap: {config.toolsGroupGap}px</span>
                          <span className="mini-ruler__line" />
                        </div>

                        <div className="mini-group">
                          <div className="mini-group-head">
                            <span className="mini-group-dot" style={{ background: "#F59E0B" }} />
                            <b>Sockets &amp; Ratchets (18)</b>
                          </div>
                          <div className="mini-grid" style={{ gap: `${config.toolsGridGap}px` }}>
                            <div className="mini-item">
                              <span>Socket Set 3/4&quot; Drive</span>
                              <button className="mini-btn">+ Add</button>
                            </div>
                            <div className="mini-item">
                              <span>Impact Socket 32mm Deep</span>
                              <button className="mini-btn">+ Add</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Gap Indicator Ruler 3 (Category Section Gap) */}
                    <div className="mini-ruler" style={{ height: `${config.toolsCategoryGap}px` }}>
                      <span className="mini-ruler__line" />
                      <span className="mini-ruler__tag mini-ruler__tag--cat">
                        Category Break Gap: {config.toolsCategoryGap}px
                      </span>
                      <span className="mini-ruler__line" />
                    </div>

                    {/* Category 2: Electrical & Cabling with Light Break Line */}
                    <div className="mini-divider" style={{ "--divider-accent": "#0EA5E9" } as React.CSSProperties}>
                      <span className="mini-divider__line" />
                      <span className="mini-divider__dot" />
                      <span className="mini-divider__text">Electrical &amp; Cabling</span>
                      <span className="mini-divider__line" />
                    </div>

                    <div
                      className="mini-cat-card"
                      style={{
                        marginBottom: `${config.toolsCategoryGap}px`,
                        borderLeftColor: "#0EA5E9",
                      }}
                    >
                      <div
                        className="mini-cat-header"
                        style={{
                          background: "linear-gradient(90deg, rgba(14, 165, 233, 0.12) 0%, #151619 100%)",
                          borderLeftColor: "#0EA5E9",
                        }}
                      >
                        <div className="mini-cat-info">
                          <span>⚡</span>
                          <div>
                            <b>Electrical &amp; Cabling</b>
                            <small>Cable jacks, drum rollers, hydraulic crimpers, and test gear.</small>
                          </div>
                        </div>
                        <span className="mini-cat-badge" style={{ color: "#38BDF8" }}>29 Tools</span>
                      </div>

                      <div className="mini-cat-body" style={{ gap: `${config.toolsGroupGap}px` }}>
                        <div className="mini-group">
                          <div className="mini-group-head">
                            <span className="mini-group-dot" style={{ background: "#0EA5E9" }} />
                            <b>Crimpers &amp; Cutters (12)</b>
                          </div>
                          <div className="mini-grid" style={{ gap: `${config.toolsGridGap}px` }}>
                            <div className="mini-item">
                              <span>Hydraulic Crimper 16-300mm</span>
                              <button className="mini-btn">+ Add</button>
                            </div>
                            <div className="mini-item">
                              <span>Armoured Cable Cutter</span>
                              <button className="mini-btn">+ Add</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Callout */}
                    <div
                      className="mini-callout"
                      style={{ marginTop: `${config.calloutMargin}px` }}
                    >
                      <div>
                        <b>Hiring tools alongside plant?</b>
                        <small>Put both on one enquiry. We quote as a single job delivered together.</small>
                      </div>
                      <button className="mini-callout-btn">Start Enquiry</button>
                    </div>
                  </div>
                ) : (
                  <div className="mini-home-preview">
                    {/* Simulated Content Section */}
                    <div
                      className="mini-section"
                      style={{ paddingBlock: `${config.sectionGap}px` }}
                    >
                      <div className="mini-rule" />
                      <span className="mini-eyebrow">Fleet Register</span>
                      <h2 className="mini-title">Available Heavy Plant</h2>

                      <div className="mini-ruler" style={{ height: "20px" }}>
                        <span className="mini-ruler__line" />
                        <span className="mini-ruler__tag">Cards Grid Gap: {config.cardGridGap}px</span>
                        <span className="mini-ruler__line" />
                      </div>

                      {/* Equipment Cards Grid */}
                      <div className="mini-egrid" style={{ gap: `${config.cardGridGap}px` }}>
                        <div className="mini-ecard">
                          <div className="mini-ecard__img">🚜 Case CX220C Excavator</div>
                          <div className="mini-ecard__body">
                            <b>Case CX220C Excavator</b>
                            <small>22t tracked crawler excavator with certified operator.</small>
                          </div>
                        </div>
                        <div className="mini-ecard">
                          <div className="mini-ecard__img">🏗️ 10T Telehandler HTH10</div>
                          <div className="mini-ecard__body">
                            <b>10T Heavy Telehandler</b>
                            <small>Heavy-duty rough terrain telescopic material handler.</small>
                          </div>
                        </div>
                        <div className="mini-ecard">
                          <div className="mini-ecard__img">⚡ 50kVA Generator</div>
                          <div className="mini-ecard__body">
                            <b>50kVA Silent Diesel Generator</b>
                            <small>Bunded site power unit with automatic changeover.</small>
                          </div>
                        </div>
                      </div>

                      <div
                        className="mini-callout"
                        style={{ marginTop: `${config.calloutMargin}px` }}
                      >
                        <div>
                          <b>Need customized site machinery?</b>
                          <small>We inspect sites and package machines for long-term project hire.</small>
                        </div>
                        <button className="mini-callout-btn">Request Quote</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
