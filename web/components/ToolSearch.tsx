"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import type { Tool } from "@/lib/types";
import { addToBasket, removeLine, getBasket, BASKET_EVENT } from "@/lib/basket";

interface CategoryMeta {
  icon: string;
  displayTitle: string;
  description: string;
  order: number;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  "Hand Tools": {
    icon: "🔧",
    displayTitle: "Hand Tools & Workshop",
    description: "Precision mechanics, wrenches, hammers, sockets, and heavy-duty manual assembly tools.",
    order: 1,
  },
  "Electrical & Cabling": {
    icon: "⚡",
    displayTitle: "Electrical & Cabling",
    description: "Cable jacks, drum rollers, hydraulic crimpers, test gear, and high-spec distribution leads.",
    order: 2,
  },
  "Power Tools": {
    icon: "🔌",
    displayTitle: "Power Tools & Machinery",
    description: "Industrial rotary hammers, magnetic base drills, angle grinders, and mobile welding rigs.",
    order: 3,
  },
  "Pipe & Hydraulic": {
    icon: "🚰",
    displayTitle: "Pipe, Plumbing & Hydraulics",
    description: "Conduit and pipe benders, hydraulic split-unit pliers, high-pressure lines, and cutters.",
    order: 4,
  },
  "Measurement & Survey": {
    icon: "📐",
    displayTitle: "Measurement & Site Survey",
    description: "Optical dumpy levels, digital laser levels, dial indicators, and calibrated site instruments.",
    order: 5,
  },
  "Lifting & Material Handling": {
    icon: "🏗️",
    displayTitle: "Lifting & Material Handling",
    description: "Hydraulic bottle jacks up to 6T, mini electric winches, pallet jacks, and access ladders.",
    order: 6,
  },
  "Safety & Site Equipment": {
    icon: "🦺",
    displayTitle: "Safety & Site Equipment",
    description: "Industrial PPE, certified fire extinguishers, chemical driptrays, and nitrogen charging units.",
    order: 7,
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
    if (t.includes("fire") || t.includes("face shield")) {
      return "PPE & Fire Response";
    }
    return "Spill Trays, Fuel & Gas";
  }

  return "General Site Equipment";
}

export default function ToolSearch({ tools }: { tools: Tool[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [subTypeFilter, setSubTypeFilter] = useState<string>("All");
  const [basketIds, setBasketIds] = useState<Set<string>>(new Set());

  // Normalize tools to ensure category accuracy
  const normalizedTools = useMemo(() => {
    return tools.map((t) => {
      let c = t.tool_category;
      if (c === "cutter-straight-line-quickie") c = "Power Tools";
      const subType = getToolSubType(t.title, c);
      return { ...t, tool_category: c, subType };
    });
  }, [tools]);

  // Sync basket state
  useEffect(() => {
    const updateBasket = () => {
      const b = getBasket();
      setBasketIds(new Set(b.map((l) => l.equipmentId)));
    };
    updateBasket();
    window.addEventListener(BASKET_EVENT, updateBasket);
    return () => window.removeEventListener(BASKET_EVENT, updateBasket);
  }, []);

  // Category counts
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

  // Reset subTypeFilter when main category changes
  const handleCatChange = (newCat: string) => {
    setCat(newCat);
    setSubTypeFilter("All");
  };

  // Sub-types available for current category filter
  const currentSubTypes = useMemo(() => {
    if (cat === "All") return [];
    const counts = new Map<string, number>();
    for (const t of normalizedTools) {
      if (t.tool_category === cat) {
        counts.set(t.subType, (counts.get(t.subType) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [normalizedTools, cat]);

  // Filtered results
  const filteredTools = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return normalizedTools.filter((t) => {
      const matchCat = cat === "All" || t.tool_category === cat;
      const matchSub = subTypeFilter === "All" || t.subType === subTypeFilter;
      const matchQuery =
        !needle ||
        t.title.toLowerCase().includes(needle) ||
        t.tool_category.toLowerCase().includes(needle) ||
        t.subType.toLowerCase().includes(needle);
      return matchCat && matchSub && matchQuery;
    });
  }, [normalizedTools, q, cat, subTypeFilter]);

  // Group filtered tools by Category, then by SubType
  const groupedByCategory = useMemo(() => {
    const map = new Map<string, Map<string, typeof normalizedTools>>();

    for (const t of filteredTools) {
      if (!map.has(t.tool_category)) {
        map.set(t.tool_category, new Map());
      }
      const subMap = map.get(t.tool_category)!;
      if (!subMap.has(t.subType)) {
        subMap.set(t.subType, []);
      }
      subMap.get(t.subType)!.push(t);
    }

    // Sort categories according to CATEGORY_META order
    const sortedCats = [...map.entries()].sort((a, b) => {
      const orderA = CATEGORY_META[a[0]]?.order ?? 99;
      const orderB = CATEGORY_META[b[0]]?.order ?? 99;
      return orderA - orderB;
    });

    return sortedCats.map(([catName, subMap]) => {
      // Sort sub-types alphabetically
      const sortedSubs = [...subMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
      // Sort tools within each sub-type alphabetically
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

      {/* Main Category Filter Pills */}
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
          return (
            <button
              key={name}
              type="button"
              className={`chip chip--btn${cat === name ? " is-on" : ""}`}
              onClick={() => handleCatChange(name)}
            >
              {meta?.icon ? `${meta.icon} ` : ""}
              {name}
              <b className="num">{n}</b>
            </button>
          );
        })}
      </div>

      {/* Sub-type Sub-Filter Chips when single category is active */}
      {cat !== "All" && currentSubTypes.length > 1 && (
        <div className="tool-subfilter-bar" role="group" aria-label="Filter by tool type">
          <span
            style={{
              fontFamily: "Archivo, sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--steel-lift)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginRight: 4,
            }}
          >
            Tool Types:
          </span>
          <button
            type="button"
            className={`tool-subchip${subTypeFilter === "All" ? " is-active" : ""}`}
            onClick={() => setSubTypeFilter("All")}
          >
            All Types
          </button>
          {currentSubTypes.map(([subName, count]) => (
            <button
              key={subName}
              type="button"
              className={`tool-subchip${subTypeFilter === subName ? " is-active" : ""}`}
              onClick={() => setSubTypeFilter(subName)}
            >
              {subName}
              <b>({count})</b>
            </button>
          ))}
        </div>
      )}

      {/* Count & Status Indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
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
          {groupedByCategory.map(({ catName, subTypes, totalCount }) => {
            const meta = CATEGORY_META[catName] || {
              icon: "📦",
              displayTitle: catName,
              description: "Specialist tools and site inventory.",
            };

            return (
              <section key={catName} className="tool-cat-section" id={`cat-${catName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                {/* Category Header Card */}
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
                      {/* Sub-type Header with Amber Indicator */}
                      <div className="tool-type-header">
                        <span className="tool-type-header__dot" />
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
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
