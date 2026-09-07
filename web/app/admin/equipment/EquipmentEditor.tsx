"use client";

import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import ImagePicker from "@/components/admin/ImagePicker";

type Item = {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  short_description: string | null;
  fleet_qty: number;
  ownership: string;
  operator_available: boolean;
  delivery_class: string | null;
  image_url: string | null;
  sort_order: number;
  active: boolean;
};
type Cat = { id: string; title: string; slug: string };

export default function EquipmentEditor({
  items: initial,
  categories,
}: {
  items: Item[];
  categories: Cat[];
}) {
  const [items, setItems] = useState(initial);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const catName = useMemo(
    () => new Map(categories.map((c) => [c.id, c.title])),
    [categories]
  );

  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return items.filter(
      (i) =>
        (catFilter === "all" || i.category_id === catFilter) &&
        (!q || i.title.toLowerCase().includes(q) || i.slug.includes(q))
    );
  }, [items, filter, catFilter]);

  const withoutImage = items.filter((i) => !i.image_url).length;

  function edit(id: string, patch: Partial<Item>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    setDirty((prev) => new Set(prev).add(id));
    setMsg(null);
  }

  async function save() {
    if (dirty.size === 0) return;
    setSaving(true);
    setErr(null);
    setMsg(null);

    const changed = items.filter((i) => dirty.has(i.id));
    const supabase = supabaseBrowser();
    const results = await Promise.all(
      changed.map((i) =>
        supabase
          .from("equipment")
          .update({
            title: i.title,
            short_description: i.short_description,
            fleet_qty: i.fleet_qty,
            operator_available: i.operator_available,
            image_url: i.image_url,
            sort_order: i.sort_order,
            active: i.active,
          })
          .eq("id", i.id)
      )
    );
    const failed = results.filter((r) => r.error);
    setSaving(false);

    if (failed.length) {
      setErr(failed[0].error?.message ?? "Some changes did not save.");
      return;
    }
    setDirty(new Set());
    setMsg(`Saved ${changed.length} item${changed.length === 1 ? "" : "s"}.`);
  }

  return (
    <>
      <div className="adm__head">
        <div>
          <h1>Equipment</h1>
          <p>
            {items.length} items. Toggle what is published, edit the copy, set the fleet count
            and drop in a photograph. {withoutImage > 0 && (
              <b>{withoutImage} still have no image.</b>
            )}
          </p>
        </div>
        <div className="adm__save">
          {dirty.size > 0 && <span className="adm__dirty">{dirty.size} unsaved</span>}
          <button className="btn btn--primary" onClick={save} disabled={saving || dirty.size === 0}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {msg && <p className="adm__ok" role="status">{msg}</p>}
      {err && <p className="formerr" role="alert">{err}</p>}

      <div className="adm__filters">
        <input
          type="search"
          placeholder="Search by name or slug…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="all">All categories ({items.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} ({items.filter((i) => i.category_id === c.id).length})
            </option>
          ))}
        </select>
        <span className="adm__count num">{shown.length} shown</span>
      </div>

      <ul className="erows">
        {shown.map((i) => {
          const open = openId === i.id;
          return (
            <li className={`erow${dirty.has(i.id) ? " is-dirty" : ""}`} key={i.id}>
              <div className="erow__top">
                <label className="erow__pub" title={i.active ? "Published" : "Hidden"}>
                  <input
                    type="checkbox"
                    checked={i.active}
                    onChange={(e) => edit(i.id, { active: e.target.checked })}
                  />
                  <span />
                </label>

                <button
                  type="button"
                  className="erow__name"
                  onClick={() => setOpenId(open ? null : i.id)}
                  aria-expanded={open}
                >
                  <b>{i.title}</b>
                  <em>{catName.get(i.category_id)}</em>
                </button>

                <span className="erow__flags">
                  {!i.image_url && <span className="flag flag--warn">No image</span>}
                  {i.ownership === "Managed" && <span className="flag">Managed</span>}
                  {!i.active && <span className="flag flag--off">Hidden</span>}
                </span>

                <button
                  type="button"
                  className="erow__toggle"
                  onClick={() => setOpenId(open ? null : i.id)}
                  aria-label={open ? "Collapse" : "Expand"}
                >
                  {open ? "−" : "+"}
                </button>
              </div>

              {open && (
                <div className="erow__body">
                  <div className="erow__grid">
                    <label className="f f--wide">
                      <span>Title</span>
                      <input
                        value={i.title}
                        onChange={(e) => edit(i.id, { title: e.target.value })}
                      />
                    </label>
                    <label className="f f--wide">
                      <span>Short description — used on cards and as the meta description</span>
                      <textarea
                        rows={2}
                        value={i.short_description ?? ""}
                        onChange={(e) => edit(i.id, { short_description: e.target.value })}
                      />
                    </label>
                    <label className="f">
                      <span>Units in fleet</span>
                      <input
                        type="number"
                        min={0}
                        value={i.fleet_qty}
                        onChange={(e) => edit(i.id, { fleet_qty: Number(e.target.value) || 0 })}
                      />
                    </label>
                    <label className="f">
                      <span>Display order</span>
                      <input
                        type="number"
                        value={i.sort_order}
                        onChange={(e) => edit(i.id, { sort_order: Number(e.target.value) || 0 })}
                      />
                    </label>
                    <label className="f erow__check">
                      <input
                        type="checkbox"
                        checked={i.operator_available}
                        onChange={(e) => edit(i.id, { operator_available: e.target.checked })}
                      />
                      <span>Operator available</span>
                    </label>
                  </div>

                  <div className="erow__img">
                    <span className="afield__label">Photograph</span>
                    <ImagePicker
                      value={i.image_url}
                      folder="equipment/"
                      hint={`Recommended: 4:3, WebP, under 300 KB. Slug is ${i.slug}.`}
                      onChange={(path) => edit(i.id, { image_url: path })}
                    />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
