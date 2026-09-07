"use client";

import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import ImagePicker from "@/components/admin/ImagePicker";
import type { SiteContent } from "@/lib/types";

type Row = SiteContent;

export default function ContentEditor({ rows }: { rows: Row[] }) {
  const [items, setItems] = useState<Row[]>(rows);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const groups = useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const r of items) {
      const g = m.get(r.group_name) ?? [];
      g.push(r);
      m.set(r.group_name, g);
    }
    return [...m.entries()];
  }, [items]);

  function edit(key: string, value: string) {
    setItems((prev) => prev.map((r) => (r.key === key ? { ...r, value } : r)));
    setDirty((prev) => new Set(prev).add(key));
    setMsg(null);
  }

  async function save() {
    if (dirty.size === 0) return;
    setSaving(true);
    setErr(null);
    setMsg(null);

    const changed = items.filter((r) => dirty.has(r.key));
    const supabase = supabaseBrowser();

    // Update rather than upsert: these rows are defined by the schema, not the UI.
    const results = await Promise.all(
      changed.map((r) =>
        supabase.from("site_content").update({ value: r.value }).eq("key", r.key)
      )
    );
    const failed = results.filter((r) => r.error);
    setSaving(false);

    if (failed.length) {
      setErr(failed[0].error?.message ?? "Some changes did not save.");
      return;
    }
    setDirty(new Set());
    setMsg(
      `Saved ${changed.length} change${changed.length === 1 ? "" : "s"}. The site picks these up within the hour, or immediately on the next deploy.`
    );
  }

  return (
    <>
      <div className="adm__head">
        <div>
          <h1>Content</h1>
          <p>
            Every editable line of copy and every photograph on the site. Change it here and it
            changes on the site — no deploy, no developer.
          </p>
        </div>
        <div className="adm__save">
          {dirty.size > 0 && <span className="adm__dirty">{dirty.size} unsaved</span>}
          <button
            className="btn btn--primary"
            onClick={save}
            disabled={saving || dirty.size === 0}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {msg && <p className="adm__ok" role="status">{msg}</p>}
      {err && <p className="formerr" role="alert">{err}</p>}

      {groups.map(([group, rows]) => (
        <section className="adm__group" key={group}>
          <h2>{group}</h2>
          <div className="adm__fields">
            {rows.map((r) => (
              <div className={`afield${dirty.has(r.key) ? " is-dirty" : ""}`} key={r.key}>
                <label htmlFor={r.key}>
                  <span className="afield__label">{r.label}</span>
                  <code className="afield__key">{r.key}</code>
                </label>

                {r.kind === "image" ? (
                  <ImagePicker
                    value={r.value}
                    folder={r.key.startsWith("cat.") ? "categories/" : ""}
                    hint={r.help ?? undefined}
                    onChange={(path) => edit(r.key, path)}
                  />
                ) : (r.value ?? "").length > 90 ? (
                  <textarea
                    id={r.key}
                    rows={3}
                    value={r.value ?? ""}
                    onChange={(e) => edit(r.key, e.target.value)}
                  />
                ) : (
                  <input
                    id={r.key}
                    type={r.kind === "number" ? "text" : "text"}
                    value={r.value ?? ""}
                    onChange={(e) => edit(r.key, e.target.value)}
                  />
                )}

                {r.help && r.kind !== "image" && <p className="afield__help">{r.help}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
