"use client";

import { useMemo } from "react";
import Link from "next/link";

type Enquiry = {
  id: string;
  status: string;
  submitted_at: string;
  items_summary?: string | null;
};

type Line = {
  id: string;
  enquiry_id: string;
  item_title: string;
  quantity: number;
};

export default function LeadInsightsWidget({
  enquiries = [],
  lines = [],
  equipmentCount = 0,
  availableCount = 0,
}: {
  enquiries: Enquiry[];
  lines: Line[];
  equipmentCount?: number;
  availableCount?: number;
}) {
  const stats = useMemo(() => {
    let newCount = 0;
    let quotedCount = 0;
    let wonCount = 0;
    let lostCount = 0;

    for (const e of enquiries) {
      const s = (e.status || "").toLowerCase();
      if (s === "new" || !s) newCount++;
      else if (s === "quoted") quotedCount++;
      else if (s === "won") wonCount++;
      else if (s === "lost") lostCount++;
    }

    // Calculate most requested equipment
    const itemDemand = new Map<string, number>();
    for (const l of lines) {
      if (l.item_title) {
        itemDemand.set(l.item_title, (itemDemand.get(l.item_title) ?? 0) + (l.quantity || 1));
      }
    }

    const topRequested = [...itemDemand.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const winRate =
      wonCount + lostCount > 0 ? Math.round((wonCount / (wonCount + lostCount)) * 100) : null;

    const availRate =
      equipmentCount > 0 ? Math.round((availableCount / equipmentCount) * 100) : 100;

    return {
      total: enquiries.length,
      newCount,
      quotedCount,
      wonCount,
      winRate,
      topRequested,
      availRate,
    };
  }, [enquiries, lines, equipmentCount, availableCount]);

  return (
    <div className="adm-kpi-grid">
      {/* KPI 1: Inbound Lead Velocity */}
      <div className={`adm-kpi-card ${stats.newCount > 0 ? "is-alert" : ""}`}>
        <div className="adm-kpi-top">
          <span className="adm-kpi-lbl">New Quote Requests</span>
          <span className="adm-kpi-icon">📥</span>
        </div>
        <div className="adm-kpi-val" style={{ color: stats.newCount > 0 ? "#f59e0b" : "#fff" }}>
          {stats.newCount}
        </div>
        <div className="adm-kpi-sub">
          {stats.newCount > 0 ? (
            <Link href="/admin/enquiries" style={{ color: "var(--amber)", textDecoration: "underline" }}>
              ⚡ {stats.newCount} quote{stats.newCount === 1 ? "" : "s"} awaiting dispatch reply
            </Link>
          ) : (
            <span style={{ color: "#34d399" }}>✓ All enquiries handled</span>
          )}
        </div>
      </div>

      {/* KPI 2: Pipeline Activity */}
      <div className="adm-kpi-card">
        <div className="adm-kpi-top">
          <span className="adm-kpi-lbl">Quotes in Pipeline</span>
          <span className="adm-kpi-icon">💼</span>
        </div>
        <div className="adm-kpi-val">{stats.quotedCount}</div>
        <div className="adm-kpi-sub">
          <span>{stats.wonCount} won contracts</span>
          {stats.winRate !== null && <span style={{ marginLeft: 6 }}>({stats.winRate}% win rate)</span>}
        </div>
      </div>

      {/* KPI 3: Top Demanded Plant */}
      <div className="adm-kpi-card is-good">
        <div className="adm-kpi-top">
          <span className="adm-kpi-lbl">Top Requested Plant</span>
          <span className="adm-kpi-icon">🔥</span>
        </div>
        {stats.topRequested.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
            {stats.topRequested.map(([title, qty]) => (
              <div
                key={title}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  color: "#fff",
                }}
              >
                <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "80%" }}>
                  {title}
                </span>
                <b style={{ color: "var(--amber)" }}>{qty}x</b>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="adm-kpi-val" style={{ fontSize: 20 }}>Crane Trucks &amp; TLBs</div>
            <div className="adm-kpi-sub">Highest enquiry volume across Gauteng</div>
          </>
        )}
      </div>

      {/* KPI 4: Fleet Availability Rate */}
      <div className="adm-kpi-card">
        <div className="adm-kpi-top">
          <span className="adm-kpi-lbl">Fleet Availability</span>
          <span className="adm-kpi-icon">📈</span>
        </div>
        <div className="adm-kpi-val" style={{ color: "#34d399" }}>
          {stats.availRate}%
        </div>
        <div className="adm-kpi-sub">
          {availableCount} of {equipmentCount} machines ready for immediate deployment
        </div>
      </div>
    </div>
  );
}
