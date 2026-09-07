"use client";
import { useMemo, useState } from "react";
import type { Tool } from "@/lib/types";

export default function ToolSearch({ tools }: { tools: Tool[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tools) counts.set(t.tool_category, (counts.get(t.tool_category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [tools]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return tools.filter(
      (t) =>
        (cat === "All" || t.tool_category === cat) &&
        (!needle || t.title.toLowerCase().includes(needle))
    );
  }, [tools, q, cat]);

  return (
    <>
      <div className="toolsearch">
        <label htmlFor="tq" className="sr-only">Search tools</label>
        <input
          id="tq"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${tools.length} tools — try “crimper” or “cable jack”`}
        />
      </div>

      <div className="chips" role="group" aria-label="Filter by category">
        <button
          type="button"
          className={`chip chip--btn${cat === "All" ? " is-on" : ""}`}
          onClick={() => setCat("All")}
        >
          All<b className="num">{tools.length}</b>
        </button>
        {categories.map(([name, n]) => (
          <button
            key={name}
            type="button"
            className={`chip chip--btn${cat === name ? " is-on" : ""}`}
            onClick={() => setCat(name)}
          >
            {name}<b className="num">{n}</b>
          </button>
        ))}
      </div>

      <p className="toolcount num" aria-live="polite">
        {results.length} of {tools.length} tools
      </p>

      {results.length === 0 ? (
        <p className="toolempty">
          Nothing matches “{q}”. We hire more than we list — ask and we&apos;ll confirm.
        </p>
      ) : (
        <ul className="toollist">
          {results.map((t) => (
            <li key={t.id}>
              <span className="toollist__t">{t.title}</span>
              <span className="toollist__c">{t.tool_category}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
