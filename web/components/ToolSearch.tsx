"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import type { Tool } from "@/lib/types";
import { addToBasket, removeLine, getBasket, BASKET_EVENT } from "@/lib/basket";

export interface CategoryMeta {
  key: string;
  icon: string;
  displayTitle: string;
  description: string;
  order: number;
  accent: string;
  gradient: string;
  softBg: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  "Hand Tools": {
    key: "hand-tools",
    icon: "🔧",
    displayTitle: "Hand Tools & Workshop",
    description: "Precision mechanics, wrenches, hammers, sockets, and heavy-duty manual assembly tools.",
    order: 1,
    accent: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    softBg: "rgba(245, 158, 11, 0.08)",
    badgeBg: "rgba(245, 158, 11, 0.14)",
    badgeBorder: "rgba(245, 158, 11, 0.38)",
    badgeText: "#FBBF24",
  },
  "Electrical & Cabling": {
    key: "electrical",
    icon: "⚡",
    displayTitle: "Electrical & Cabling",
    description: "Cable jacks, drum rollers, hydraulic crimpers, test gear, and high-spec distribution leads.",
    order: 2,
    accent: "#0EA5E9",
    gradient: "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)",
    softBg: "rgba(14, 165, 233, 0.08)",
    badgeBg: "rgba(14, 165, 233, 0.14)",
    badgeBorder: "rgba(14, 165, 233, 0.38)",
    badgeText: "#38BDF8",
  },
  "Power Tools": {
    key: "power-tools",
    icon: "🔌",
    displayTitle: "Power Tools & Machinery",
    description: "Industrial rotary hammers, magnetic base drills, angle grinders, and mobile welding rigs.",
    order: 3,
    accent: "#FF4500",
    gradient: "linear-gradient(135deg, #FF4500 0%, #DC2626 100%)",
    softBg: "rgba(255, 69, 0, 0.08)",
    badgeBg: "rgba(255, 69, 0, 0.14)",
    badgeBorder: "rgba(255, 69, 0, 0.38)",
    badgeText: "#FFA07A",
  },
  "Pipe & Hydraulic": {
    key: "pipe-hydraulic",
    icon: "🚰",
    displayTitle: "Pipe, Plumbing & Hydraulics",
    description: "Conduit and pipe benders, hydraulic split-unit pliers, high-pressure lines, and cutters.",
    order: 4,
    accent: "#06B6D4",
    gradient: "linear-gradient(135deg, #06B6D4 0%, #0D9488 100%)",
    softBg: "rgba(6, 182, 212, 0.08)",
    badgeBg: "rgba(6, 182, 212, 0.14)",
    badgeBorder: "rgba(6, 182, 212, 0.38)",
    badgeText: "#22D3EE",
  },
  "Measurement & Survey": {
    key: "measurement-survey",
    icon: "📐",
    displayTitle: "Measurement & Site Survey",
    description: "Optical dumpy levels, digital laser levels, dial indicators, and calibrated site instruments.",
    order: 5,
    accent: "#10B981",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    softBg: "rgba(16, 185, 129, 0.08)",
    badgeBg: "rgba(16, 185, 129, 0.14)",
    badgeBorder: "rgba(16, 185, 129, 0.38)",
    badgeText: "#34D399",
  },
  "Lifting & Material Handling": {
    key: "lifting-handling",
    icon: "🏗️",
    displayTitle: "Lifting & Material Handling",
    description: "Hydraulic bottle jacks up to 6T, mini electric winches, pallet jacks, and access ladders.",
    order: 6,
    accent: "#A855F7",
    gradient: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)",
    softBg: "rgba(168, 85, 247, 0.08)",
    badgeBg: "rgba(168, 85, 247, 0.14)",
    badgeBorder: "rgba(168, 85, 247, 0.38)",
    badgeText: "#C084FC",
  },
  "Safety & Site Equipment": {
    key: "safety-site",
    icon: "🦺",
    displayTitle: "Safety & Site Equipment",
    description: "Industrial PPE, certified fire extinguishers, chemical driptrays, and nitrogen charging units.",
    order: 7,
    accent: "#F43F5E",
    gradient: "linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)",
    softBg: "rgba(244, 63, 94, 0.08)",
    badgeBg: "rgba(244, 63, 94, 0.14)",
    badgeBorder: "rgba(244, 63, 94, 0.38)",
    badgeText: "#FB7185",
  },
};

export function getToolSubType(title: string, category: string): string {
  const t = title.toLowerCase();

  if (category === "Hand Tools") {
    if (t.includes("spanner") || t.includes("wrench") || t.includes("torque") || t.includes("allen key")) {
      return "Wrenches & Spanners";
    }
    if (t.includes("socket") || t.includes("ratchet")) {
      return "Sockets & Ratchets";
    }
    if (t.includes("cutter") || t.includes("plier") || t.includes("scissors") || t.includes("blik") || t.includes("gas plier")) {
      return "Pliers & Cutters";
    }
    if (t.includes("hammer") || t.includes("chisel") || t.includes("crowbar") || t.includes("koevoet")) {
      return "Hammers & Chisels";
    }
    if (t.includes("saw") || t.includes("knife") || t.includes("houtsaag")) {
      return "Saws & Blades";
    }
    if (t.includes("screw driver") || t.includes("strapping") || t.includes("clamp") || t.includes("poprivet")) {
      return "Fasteners & Clamping";
    }
    if (t.includes("punch") || t.includes("die") || t.includes("spray") || t.includes("grease") || t.includes("silicon") || t.includes("weldblock")) {
      return "Punches & Workshop Specialist";
    }
    return "Site & General Hand Tools";
  }

  if (category === "Power Tools" || category === "cutter-straight-line-quickie") {
    if (t.includes("drill") || t.includes("chuck") || t.includes("rotary hammer") || t.includes("jackhammer")) {
      return "Drills & Rotary Hammers";
    }
    if (t.includes("grinder")) {
      return "Grinders & Sanders";
    }
    if (t.includes("saw") || t.includes("cutt off") || t.includes("cutter")) {
      return "Cut-Off Saws & Cutters";
    }
    if (t.includes("compressor") || t.includes("blower") || t.includes("heat gun") || t.includes("vacuum")) {
      return "Air & Thermal Equipment";
    }
    if (t.includes("welding") || t.includes("generator") || t.includes("impact") || t.includes("clock")) {
      return "Welding & Assembly";
    }
    return "Industrial Power Equipment";
  }

  if (category === "Electrical & Cabling") {
    if (t.includes("jack") || t.includes("roller") || t.includes("fish tape")) {
      return "Cable Drum & Hauling";
    }
    if (t.includes("crimp") || t.includes("cutter") || t.includes("stripper") || t.includes("knife") || t.includes("spanner")) {
      return "Crimpers, Cutters & Termination";
    }
    if (t.includes("cord") || t.includes("extension") || t.includes("plug") || t.includes("jumper")) {
      return "Power Leads & Distribution";
    }
    if (t.includes("light") || t.includes("torch")) {
      return "Site Floodlighting & Torches";
    }
    return "Electrical Tools & Toolbags";
  }

  if (category === "Pipe & Hydraulic") {
    if (t.includes("bender") || t.includes("cutter") || t.includes("drain")) {
      return "Pipe Benders & Cutters";
    }
    if (t.includes("wrench")) {
      return "Heavy Pipe Wrenches";
    }
    return "Hydraulic Coupling & Pressure";
  }

  if (category === "Measurement & Survey") {
    if (t.includes("level") || t.includes("tripod") || t.includes("dumpy")) {
      return "Optical & Digital Levels";
    }
    if (t.includes("tape") || t.includes("wheel") || t.includes("ruler")) {
      return "Linear Measuring & Wheels";
    }
    return "Precision Squares & Indicators";
  }

  if (category === "Lifting & Material Handling") {
    if (t.includes("jack") || t.includes("winch")) {
      return "Hydraulic Bottle Jacks & Winches";
    }
    return "Site Transport & Access";
  }

  if (category === "Safety & Site Equipment") {
    if (t.includes("extinguisher") || t.includes("fire")) {
      return "Fire Safety & Suppression";
    }
    if (t.includes("driptray") || t.includes("bottle") || t.includes("nitrogen")) {
      return "Chemical, Gas & Containment";
    }
    return "Site Protection & PPE";
  }

  return "General Site Inventory";
}

export default function ToolSearch({ tools }: { tools: Tool[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [subTypeFilter, setSubTypeFilter] = useState("All");
  const [basketIds, setBasketIds] = useState<Set<string>>(new Set());

  // Keep basket items in sync
  useEffect(() => {
    const sync = () => {
      const b = getBasket();
      setBasketIds(new Set(b.map((l) => l.equipmentId)));
    };
    sync();
    window.addEventListener(BASKET_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(BASKET_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Standardize tools with resolved category & sub-type
  const normalizedTools = useMemo(() => {
    return tools.map((t) => {
      let resolvedCategory = t.tool_category;
      if (resolvedCategory === "cutter-straight-line-quickie" || resolvedCategory === "straight-line-cutter") {
        resolvedCategory = "Power Tools";
      }
      const subType = getToolSubType(t.title, resolvedCategory);
      return {
        ...t,
        tool_category: resolvedCategory,
        subType,
      };
    });
  }, [tools]);

  // Overall categories with count
  const categoriesWithCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of normalizedTools) {
      counts.set(t.tool_category, (counts.get(t.tool_category) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => {
      const orderA = CATEGORY_META[a[0]]?.order ?? 99;
      const orderB = CATEGORY_META[b[0]]?.order ?? 99;
      return orderA - orderB;
    });
  }, [normalizedTools]);

  // Sub-types available within active category
  const currentSubTypes = useMemo(() => {
    if (cat === "All") return [];
    const subCounts = new Map<string, number>();
    for (const t of normalizedTools) {
      if (t.tool_category === cat) {
        subCounts.set(t.subType, (subCounts.get(t.subType) ?? 0) + 1);
      }
    }
    return [...subCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [cat, normalizedTools]);

  // Reset sub-type filter whenever category changes
  const handleCatChange = (newCat: string) => {
    setCat(newCat);
    setSubTypeFilter("All");
  };

  // Filtered tools
  const filteredTools = useMemo(() => {
    const query = q.trim().toLowerCase();
    return normalizedTools.filter((t) => {
      if (cat !== "All" && t.tool_category !== cat) return false;
      if (subTypeFilter !== "All" && t.subType !== subTypeFilter) return false;
      if (!query) return true;
      return (
        t.title.toLowerCase().includes(query) ||
        t.tool_category.toLowerCase().includes(query) ||
        t.subType.toLowerCase().includes(query)
      );
    });
  }, [normalizedTools, q, cat, subTypeFilter]);

  // Group filtered tools by Category, then by Sub-Type
  const groupedByCategory = useMemo(() => {
    const catMap = new Map<string, Map<string, typeof normalizedTools>>();

    for (const tool of filteredTools) {
      if (!catMap.has(tool.tool_category)) {
        catMap.set(tool.tool_category, new Map());
      }
      const subMap = catMap.get(tool.tool_category)!;
      if (!subMap.has(tool.subType)) {
        subMap.set(tool.subType, []);
      }
      subMap.get(tool.subType)!.push(tool);
    }

    const sortedCats = [...catMap.entries()].sort((a, b) => {
      const orderA = CATEGORY_META[a[0]]?.order ?? 99;
      const orderB = CATEGORY_META[b[0]]?.order ?? 99;
      return orderA - orderB;
    });

    return sortedCats.map(([catName, subMap]) => {
      const sortedSubs = [...subMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
      sortedSubs.forEach(([_, list]) => list.sort((a, b) => a.title.localeCompare(b.title)));
      const totalCount = sortedSubs.reduce((acc, [_, list]) => acc + list.length, 0);
      return { catName, subTypes: sortedSubs, totalCount };
    });
  }, [filteredTools]);

  const toggleBasket = (tool: (typeof normalizedTools)[0]) => {
    if (basketIds.has(tool.id)) {
      removeLine(tool.id);
    } else {
      addToBasket({
        equipmentId: tool.id,
        slug: tool.slug,
        title: tool.title,
        qty: 1,
        days: 1,
        requiredFrom: null,
      });
    }
  };

  const activeCategoryMeta = cat !== "All" ? CATEGORY_META[cat] : null;

  return (
    <>
      {/* Search Input Bar with Icon and Quick Clear */}
      <div className="toolsearch-box">
        <span className="toolsearch-icon">🔍</span>
        <label htmlFor="tq" className="sr-only">
          Search tools
        </label>
        <input
          id="tq"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${normalizedTools.length} tools — try "crimper", "socket", "drill" or "hydraulic"`}
        />
        {q && (
          <button
            type="button"
            className="toolsearch-clear"
            onClick={() => setQ("")}
            title="Clear search"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Main Category Filter Pills with Unique Color Gradients */}
      <div className="tool-filter-bar" role="group" aria-label="Filter by tool category">
        <button
          type="button"
          className={`chip chip--btn${cat === "All" ? " is-on" : ""}`}
          onClick={() => handleCatChange("All")}
        >
          All Fleet Tools<b className="num">{normalizedTools.length}</b>
        </button>
        {categoriesWithCounts.map(([name, n]) => {
          const meta = CATEGORY_META[name];
          const isSelected = cat === name;
          return (
            <button
              key={name}
              type="button"
              className={`chip chip--btn chip--toolcat chip--${meta?.key || "cat"}${isSelected ? " is-on" : ""}`}
              style={
                isSelected && meta
                  ? {
                      background: meta.gradient,
                      borderColor: "transparent",
                      color: "#fff",
                      boxShadow: `0 4px 16px ${meta.accent}40`,
                    }
                  : meta
                  ? ({
                      "--chip-accent": meta.accent,
                      "--chip-soft": meta.softBg,
                    } as React.CSSProperties)
                  : undefined
              }
              onClick={() => handleCatChange(name)}
            >
              <span className="chip__icon">{meta?.icon ? `${meta.icon} ` : ""}</span>
              {name}
              <b
                className="num"
                style={
                  isSelected
                    ? { color: "#fff" }
                    : meta
                    ? { color: meta.accent }
                    : undefined
                }
              >
                {n}
              </b>
            </button>
          );
        })}
      </div>

      {/* Sub-type Sub-Filter Chips when single category is active */}
      {cat !== "All" && currentSubTypes.length > 1 && (
        <div
          className="tool-subfilter-bar"
          role="group"
          aria-label="Filter by tool type"
          style={
            activeCategoryMeta
              ? ({
                  borderLeftColor: activeCategoryMeta.accent,
                  borderLeftWidth: "3px",
                } as React.CSSProperties)
              : undefined
          }
        >
          <span
            style={{
              fontFamily: "Archivo, sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              color: activeCategoryMeta ? activeCategoryMeta.accent : "var(--steel-lift)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginRight: 4,
            }}
          >
            {activeCategoryMeta?.icon} Tool Types:
          </span>
          <button
            type="button"
            className={`tool-subchip${subTypeFilter === "All" ? " is-active" : ""}`}
            style={
              subTypeFilter === "All" && activeCategoryMeta
                ? {
                    background: activeCategoryMeta.softBg,
                    borderColor: activeCategoryMeta.accent,
                    color: activeCategoryMeta.accent,
                  }
                : undefined
            }
            onClick={() => setSubTypeFilter("All")}
          >
            All Types
          </button>
          {currentSubTypes.map(([subName, count]) => {
            const isActive = subTypeFilter === subName;
            return (
              <button
                key={subName}
                type="button"
                className={`tool-subchip${isActive ? " is-active" : ""}`}
                style={
                  isActive && activeCategoryMeta
                    ? {
                        background: activeCategoryMeta.softBg,
                        borderColor: activeCategoryMeta.accent,
                        color: activeCategoryMeta.accent,
                      }
                    : undefined
                }
                onClick={() => setSubTypeFilter(subName)}
              >
                {subName}
                <b>({count})</b>
              </button>
            );
          })}
        </div>
      )}

      {/* Count & Status Indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <p className="toolcount num" style={{ margin: 0 }} aria-live="polite">
          {q ? (
            <>
              Found <b>{filteredTools.length}</b> matching &ldquo;{q}&rdquo; across {groupedByCategory.length} categories
            </>
          ) : (
            <>
              Showing <b>{filteredTools.length}</b> of {normalizedTools.length} tools
              {cat !== "All" ? ` in ${cat}` : ` across ${groupedByCategory.length} categories`}
            </>
          )}
        </p>

        {basketIds.size > 0 && (
          <Link
            href="/enquiry"
            className="btn btn--ghost btn--sm"
            style={{
              fontSize: "11px",
              padding: "5px 12px",
              borderColor: "var(--amber)",
              color: "var(--amber)",
            }}
          >
            🛒 View Enquiry ({basketIds.size} selected) →
          </Link>
        )}
      </div>

      {/* Categorized & Sub-Type Grouped Layout */}
      {filteredTools.length === 0 ? (
        <div
          className="toolempty"
          style={{
            background: "var(--char)",
            border: "1px dashed var(--char2)",
            borderRadius: 4,
            padding: "44px 28px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 32, display: "block", marginBottom: 12 }}>🔍</span>
          <p style={{ margin: 0, fontSize: 17, color: "#fff", fontWeight: 600 }}>
            No tools match &ldquo;{q}&rdquo; {cat !== "All" ? `in ${cat}` : ""}
          </p>
          <p style={{ margin: "8px 0 16px", color: "var(--steel-lift)", fontSize: 14 }}>
            We stock specialized site gear beyond our published catalog. Contact our yard to confirm availability.
          </p>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              setQ("");
              setCat("All");
              setSubTypeFilter("All");
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="tool-sections-container">
          {groupedByCategory.map(({ catName, subTypes, totalCount }, catIdx) => {
            const meta = CATEGORY_META[catName] || {
              key: "other",
              icon: "📦",
              displayTitle: catName,
              description: "Specialist tools and site inventory.",
              order: 99,
              accent: "var(--amber)",
              gradient: "var(--grad)",
              softBg: "rgba(245, 165, 36, 0.08)",
              badgeBg: "rgba(245, 165, 36, 0.12)",
              badgeBorder: "rgba(245, 165, 36, 0.3)",
              badgeText: "var(--amber)",
            };

            return (
              <div key={catName} className="tool-cat-wrapper">
                {/* Light Break Line / Divider between Categories */}
                {catIdx > 0 && (
                  <div
                    className="tool-cat-divider"
                    style={{ "--divider-accent": meta.accent } as React.CSSProperties}
                  >
                    <span className="tool-cat-divider__line" />
                    <span className="tool-cat-divider__badge">
                      <span className="tool-cat-divider__dot" />
                      <span className="tool-cat-divider__label">{meta.displayTitle}</span>
                    </span>
                    <span className="tool-cat-divider__line" />
                  </div>
                )}

                <div
                  className="tool-cat-section"
                  id={`cat-${catName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  style={{
                    "--cat-accent": meta.accent,
                    "--cat-gradient": meta.gradient,
                    "--cat-soft-bg": meta.softBg,
                    "--cat-badge-bg": meta.badgeBg,
                    "--cat-badge-border": meta.badgeBorder,
                    "--cat-badge-text": meta.badgeText,
                  } as React.CSSProperties}
                >
                  {/* Category Header Card with Unique Color Gradient Accents */}
                  <div className="tool-cat-header">
                    <div className="tool-cat-header__info">
                      <span className="tool-cat-header__icon">{meta.icon}</span>
                      <div>
                        <h2 className="tool-cat-header__title">{meta.displayTitle}</h2>
                        <p className="tool-cat-header__desc">{meta.description}</p>
                      </div>
                    </div>
                    <span className="tool-cat-header__badge num">
                      {totalCount} {totalCount === 1 ? "Tool" : "Tools"}
                    </span>
                  </div>

                  {/* Body: Grouped by Tool Types */}
                  <div className="tool-cat-body">
                    {subTypes.map(([subName, toolsInSub]) => (
                      <div key={subName} className="tool-type-group">
                        {/* Sub-type Header with Category-Tinted Indicator */}
                        <div className="tool-type-header">
                          <span
                            className="tool-type-header__dot"
                            style={{
                              background: meta.accent,
                              boxShadow: `0 0 8px ${meta.accent}80`,
                            }}
                          />
                          <h3 className="tool-type-header__title">{subName}</h3>
                          <span className="tool-type-header__count num">
                            ({toolsInSub.length})
                          </span>
                        </div>

                        {/* Tool Items Grid */}
                        <ul className="tool-items-grid">
                          {toolsInSub.map((t) => {
                            const isInBasket = basketIds.has(t.id);

                            return (
                              <li key={t.id} className="tool-item-card">
                                <div className="tool-item-card__main">
                                  <span className="tool-item-card__name">{t.title}</span>
                                  <span className="tool-item-card__tag">{subName}</span>
                                </div>

                                <button
                                  type="button"
                                  className={`tool-item-card__btn${isInBasket ? " is-added" : ""}`}
                                  onClick={() => toggleBasket(t)}
                                  title={isInBasket ? "Remove from enquiry" : "Add tool to enquiry"}
                                  aria-label={`${isInBasket ? "Remove" : "Add"} ${t.title}`}
                                >
                                  {isInBasket ? "✓ In Enquiry" : "+ Add"}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
