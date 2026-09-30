"use client";

import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { getFirebaseClient } from "@/lib/firebase/client";
import { doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import ImagePicker from "@/components/admin/ImagePicker";
import ImageEditorModal from "@/components/admin/ImageEditorModal";

type AvailabilityStatus = "available" | "limited" | "on_hire" | "maintenance";

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
  availability_status?: AvailabilityStatus;
  featured?: boolean;
  specs_badges?: string[];
};

type Cat = { id: string; title: string; slug: string; sort_order?: number };

const PRESET_BADGES = [
  "10T Payload",
  "15T Capacity",
  "25T Crane",
  "35T Rig",
  "45T Hauler",
  "8.3m Boom",
  "14m Reach",
  "17m Reach",
  "26m Platform",
  "4x4 All-Terrain",
  "Rough Terrain",
  "Load Tested 2026 ✅",
  "Mine-Spec Fitted",
  "ROPS / FOPS Cab",
  "Certified Operator",
  "Telemetry Tracked",
];

export default function EquipmentEditor({
  items: initial,
  categories: initialCategories,
}: {
  items: Item[];
  categories: Cat[];
}) {
  const [items, setItems] = useState<Item[]>(initial);
  const [cats, setCats] = useState<Cat[]>(initialCategories);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"rows" | "cards">("cards");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Direct Image Editor Modal State
  const [editingImageItem, setEditingImageItem] = useState<Item | null>(null);

  // Category Reorder Modal State
  const [showCatOrderModal, setShowCatOrderModal] = useState(false);
  const [savingCatOrder, setSavingCatOrder] = useState(false);

  // Add Item Modal State
  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [customBadgeInputs, setCustomBadgeInputs] = useState<Record<string, string>>({});
  const [newItem, setNewItem] = useState<{
    title: string;
    slug: string;
    category_id: string;
    short_description: string;
    fleet_qty: number;
    ownership: string;
    operator_available: boolean;
    delivery_class: string;
    image_url: string;
    availability_status: AvailabilityStatus;
    featured: boolean;
    specs_badges: string[];
  }>({
    title: "",
    slug: "",
    category_id: initialCategories[0]?.id || "earthmoving-material-handling",
    short_description: "",
    fleet_qty: 1,
    ownership: "Owned",
    operator_available: true,
    delivery_class: "Standard",
    image_url: "",
    availability_status: "available",
    featured: false,
    specs_badges: [],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const catName = useMemo(
    () => new Map(cats.map((c) => [c.id, c.title])),
    [cats]
  );

  // Fleet Pulse Real-Time Breakdown
  const pulseStats = useMemo(() => {
    let available = 0;
    let limited = 0;
    let onHire = 0;
    let workshop = 0;
    let featured = 0;

    for (const item of items) {
      if (item.featured) featured++;
      const st = item.availability_status || "available";
      if (st === "available") available++;
      else if (st === "limited") limited++;
      else if (st === "on_hire") onHire++;
      else if (st === "maintenance") workshop++;
    }

    return { available, limited, onHire, workshop, featured, total: items.length };
  }, [items]);

  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return items.filter(
      (i) =>
        (catFilter === "all" || i.category_id === catFilter) &&
        (!q || i.title.toLowerCase().includes(q) || i.slug.includes(q))
    );
  }, [items, filter, catFilter]);

  function edit(id: string, patch: Partial<Item>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    setDirty((prev) => new Set(prev).add(id));
    setMsg(null);
  }

  function toggleBadge(itemId: string, badge: string) {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const current = item.specs_badges || [];
    const next = current.includes(badge)
      ? current.filter((b) => b !== badge)
      : [...current, badge];
    edit(itemId, { specs_badges: next });
  }

  function addCustomBadge(itemId: string) {
    const customText = (customBadgeInputs[itemId] || "").trim();
    if (!customText) return;
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const current = item.specs_badges || [];
    if (!current.includes(customText)) {
      edit(itemId, { specs_badges: [...current, customText] });
    }
    setCustomBadgeInputs((prev) => ({ ...prev, [itemId]: "" }));
  }

  async function save() {
    if (dirty.size === 0) return;
    setSaving(true);
    setErr(null);
    setMsg(null);

    const changed = items.filter((i) => dirty.has(i.id));
    const { db } = getFirebaseClient();

    try {
      await Promise.all(
        changed.map((i) =>
          updateDoc(doc(db, "equipment", i.id), {
            title: i.title,
            short_description: i.short_description,
            fleet_qty: i.fleet_qty,
            operator_available: i.operator_available,
            image_url: i.image_url,
            sort_order: i.sort_order,
            active: i.active,
            availability_status: i.availability_status || "available",
            featured: !!i.featured,
            specs_badges: i.specs_badges || [],
          })
        )
      );
      setDirty(new Set());
      setMsg(`Saved ${changed.length} item${changed.length === 1 ? "" : "s"} successfully!`);
    } catch (error: any) {
      setErr(error.message ?? "Some changes did not save.");
    } finally {
      setSaving(false);
    }
  }

  // Move Category Up / Down
  function moveCategory(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cats.length) return;

    const newCats = [...cats];
    const temp = newCats[index];
    newCats[index] = newCats[targetIndex];
    newCats[targetIndex] = temp;

    // Re-assign sort_orders
    const updated = newCats.map((c, idx) => ({ ...c, sort_order: (idx + 1) * 10 }));
    setCats(updated);
  }

  async function saveCategoryOrder() {
    setSavingCatOrder(true);
    setErr(null);
    const { db } = getFirebaseClient();

    try {
      await Promise.all(
        cats.map((c, idx) =>
          updateDoc(doc(db, "equipment_categories", c.id), {
            sort_order: (idx + 1) * 10,
          })
        )
      );
      setShowCatOrderModal(false);
      setMsg("Category sequence reordered and saved successfully!");
    } catch (e: any) {
      setErr("Failed to save category order: " + e.message);
    } finally {
      setSavingCatOrder(false);
    }
  }

  async function handleCreateItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.title.trim()) return;

    setAddingItem(true);
    setErr(null);

    const generatedSlug =
      newItem.slug.trim() ||
      newItem.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const newId = generatedSlug;
    const { db } = getFirebaseClient();

    const createdItem: Item = {
      id: newId,
      title: newItem.title.trim(),
      slug: generatedSlug,
      category_id: newItem.category_id,
      short_description: newItem.short_description.trim() || null,
      fleet_qty: newItem.fleet_qty,
      ownership: newItem.ownership,
      operator_available: newItem.operator_available,
      delivery_class: newItem.delivery_class,
      image_url: newItem.image_url.trim() || null,
      sort_order: items.length + 1,
      active: true,
      availability_status: newItem.availability_status,
      featured: newItem.featured,
      specs_badges: newItem.specs_badges,
    };

    try {
      await setDoc(doc(db, "equipment", newId), createdItem);
      setItems((prev) => [createdItem, ...prev]);
      setShowAddModal(false);
      setMsg(`Created new item "${createdItem.title}" successfully!`);
      setNewItem({
        title: "",
        slug: "",
        category_id: cats[0]?.id || "",
        short_description: "",
        fleet_qty: 1,
        ownership: "Owned",
        operator_available: true,
        delivery_class: "Standard",
        image_url: "",
        availability_status: "available",
        featured: false,
        specs_badges: [],
      });
    } catch (error: any) {
      setErr(`Failed to create item: ${error.message}`);
    } finally {
      setAddingItem(false);
    }
  }

  async function handleDeleteItem(item: Item) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently remove "${item.title}" from the database?\n\nTip: If you only want to hide it from clients, you can uncheck the "Published" box instead.`
    );
    if (!confirmed) return;

    const { db } = getFirebaseClient();
    try {
      await deleteDoc(doc(db, "equipment", item.id));
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setDirty((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      setMsg(`Removed "${item.title}".`);
    } catch (error: any) {
      setErr(`Could not delete item: ${error.message}`);
    }
  }

  const getImgSrc = (url: string | null) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `/media/${url}`;
  };

  return (
    <>
      <div className="adm__head">
        <div>
          <h1>Equipment Fleet Manager</h1>
          <p>
            {items.length} fleet machines. Control live availability, toggle priority featured equipment, build capability badges, and customize photography.
          </p>
        </div>

        <div className="adm__save">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setShowCatOrderModal(true)}
            title="Reorder category sequence on homepage and catalogue"
          >
            📁 Reorder Categories
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setShowAddModal(true)}
          >
            + Add New Equipment
          </button>
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

      {/* Fleet Pulse Real-Time Status Bar */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(20,21,24,0.95) 0%, rgba(28,30,33,0.95) 100%)",
          border: "1px solid var(--char2)",
          borderRadius: 6,
          padding: "14px 20px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: "Archivo, sans-serif",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--steel-lift)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span className="pulse-dot pulse-dot--available" />
          Fleet Pulse:
        </span>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 13 }}>
          <span style={{ color: "#34d399", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span className="pulse-dot pulse-dot--available" />
            <b>{pulseStats.available}</b> Available Now
          </span>
          <span style={{ color: "#fbbf24", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span className="pulse-dot pulse-dot--limited" />
            <b>{pulseStats.limited}</b> Limited Stock
          </span>
          <span style={{ color: "#f87171", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span className="pulse-dot pulse-dot--on_hire" />
            <b>{pulseStats.onHire}</b> On Project Hire
          </span>
          <span style={{ color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span className="pulse-dot pulse-dot--maintenance" />
            <b>{pulseStats.workshop}</b> In Workshop
          </span>
          <span style={{ color: "var(--amber)", display: "inline-flex", alignItems: "center", gap: 5 }}>
            ⭐ <b>{pulseStats.featured}</b> Featured Fleet
          </span>
        </div>
      </div>

      {/* Categorized Filter Pills */}
      <div className="cat-pills" role="tablist">
        <button
          type="button"
          className={`cat-pill ${catFilter === "all" ? "active" : ""}`}
          onClick={() => setCatFilter("all")}
        >
          <span>All Fleet</span>
          <span className="cat-pill__count">{items.length}</span>
        </button>

        {cats.map((c) => {
          const count = items.filter((i) => i.category_id === c.id).length;
          return (
            <button
              key={c.id}
              type="button"
              className={`cat-pill ${catFilter === c.id ? "active" : ""}`}
              onClick={() => setCatFilter(c.id)}
            >
              <span>{c.title}</span>
              <span className="cat-pill__count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Controls Bar: Search & View Switcher */}
      <div className="adm__filters">
        <input
          type="search"
          placeholder="Search machine name or model…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ flex: "1 1 240px" }}
        />

        <div className="view-switch">
          <button
            type="button"
            className={`view-switch__btn ${viewMode === "rows" ? "active" : ""}`}
            onClick={() => setViewMode("rows")}
            title="List / Table View"
          >
            📋 Rows
          </button>
          <button
            type="button"
            className={`view-switch__btn ${viewMode === "cards" ? "active" : ""}`}
            onClick={() => setViewMode("cards")}
            title="Visual Card Grid (Wix-Style)"
          >
            🎴 Visual Cards
          </button>
        </div>

        <span className="adm__count num">{shown.length} shown</span>
      </div>

      {/* View Mode 1: Visual Cards Grid */}
      {viewMode === "cards" ? (
        <div className="ecards-grid">
          {shown.map((i) => {
            const imgSrc = getImgSrc(i.image_url);
            const availStatus = i.availability_status || "available";

            return (
              <div className={`ecard${dirty.has(i.id) ? " is-dirty" : ""}`} key={i.id}>
                {/* Small Preview Window with direct framing trigger */}
                <div
                  className="ecard__preview"
                  onClick={() => setEditingImageItem(i)}
                  title="Click to Crop, Zoom & Pan this photo"
                >
                  {imgSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgSrc} alt={i.title} className="ecard__preview-img" />
                  ) : (
                    <div className="ecard__preview-empty">
                      <span>📷</span>
                      <span>+ Add Photo</span>
                    </div>
                  )}
                  <div className="ecard__overlay-btn">
                    <span>⛶ Frame &amp; Zoom</span>
                  </div>
                </div>

                <div className="ecard__body">
                  <div className="ecard__topline">
                    <span className="ecard__cat">
                      {catName.get(i.category_id) || i.category_id}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                      <button
                        type="button"
                        className={`star-btn ${i.featured ? "is-starred" : ""}`}
                        onClick={() => edit(i.id, { featured: !i.featured })}
                        title="Toggle Featured Machinery on Homepage"
                      >
                        ⭐ {i.featured ? "Featured" : "Pin"}
                      </button>
                      <label className="erow__pub" title={i.active ? "Published" : "Hidden"}>
                        <input
                          type="checkbox"
                          checked={i.active}
                          onChange={(e) => edit(i.id, { active: e.target.checked })}
                        />
                        <span />
                      </label>
                    </div>
                  </div>

                  <input
                    className="ecard__title-input"
                    value={i.title}
                    onChange={(e) => edit(i.id, { title: e.target.value })}
                    title="Machine Title"
                  />

                  {/* Availability Status Selector */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
                    <span style={{ fontSize: 11, color: "var(--steel-lift)", fontWeight: 600 }}>Status:</span>
                    <select
                      className="avail-select"
                      style={{ flex: 1 }}
                      value={availStatus}
                      onChange={(e) => edit(i.id, { availability_status: e.target.value as AvailabilityStatus })}
                    >
                      <option value="available">🟢 Available Now</option>
                      <option value="limited">🟡 Limited Stock</option>
                      <option value="on_hire">🔴 On Project Hire</option>
                      <option value="maintenance">🔧 In Workshop / Service</option>
                    </select>
                  </div>

                  <textarea
                    className="ecard__desc-input"
                    rows={2}
                    placeholder="Short description..."
                    value={i.short_description ?? ""}
                    onChange={(e) => edit(i.id, { short_description: e.target.value })}
                  />

                  {/* Capability Badge Chips */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, margin: "4px 0" }}>
                    {(i.specs_badges || []).map((b) => (
                      <span key={b} className="spec-active-badge">
                        {b}
                        <button type="button" onClick={() => toggleBadge(i.id, b)} title="Remove badge">
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="ecard__meta">
                    <label className="ecard__qty">
                      <span>Units:</span>
                      <input
                        type="number"
                        min={0}
                        value={i.fleet_qty}
                        onChange={(e) => edit(i.id, { fleet_qty: Number(e.target.value) || 0 })}
                      />
                    </label>

                    <label className="f erow__check" style={{ fontSize: "11px", margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={i.operator_available}
                        onChange={(e) => edit(i.id, { operator_available: e.target.checked })}
                      />
                      <span>Operator</span>
                    </label>

                    <Link
                      href={`/equipment/item/${i.slug}`}
                      target="_blank"
                      className="btn btn--ghost btn--sm"
                      style={{ marginLeft: "auto", fontSize: "10px", padding: "4px 8px" }}
                      title="View live on website"
                    >
                      View ↗
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View Mode 2: Enhanced Rows with Fleet Pulse & Spec Builder */
        <ul className="erows">
          {shown.map((i) => {
            const open = openId === i.id;
            const imgSrc = getImgSrc(i.image_url);
            const availStatus = i.availability_status || "available";

            return (
              <li className={`erow${dirty.has(i.id) ? " is-dirty" : ""}`} key={i.id}>
                <div className="erow__top">
                  {/* Small Preview Window */}
                  <div
                    className="erow__thumb"
                    onClick={() => setEditingImageItem(i)}
                    title="Click to Crop, Zoom & Pan photo in the viewing frame"
                  >
                    {imgSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imgSrc} alt={i.title} className="erow__thumb-img" />
                    ) : (
                      <div className="erow__thumb-empty">
                        <span>+ Photo</span>
                      </div>
                    )}
                    <span className="erow__thumb-badge">Frame ⛶</span>
                  </div>

                  {/* Starred Feature Button */}
                  <button
                    type="button"
                    className={`star-btn ${i.featured ? "is-starred" : ""}`}
                    onClick={() => edit(i.id, { featured: !i.featured })}
                    title="Toggle Featured Machinery on Homepage"
                    style={{ marginRight: 6 }}
                  >
                    ⭐ {i.featured ? "Featured" : "Pin"}
                  </button>

                  {/* Published Toggle Switch */}
                  <label className="erow__pub" title={i.active ? "Published" : "Hidden"}>
                    <input
                      type="checkbox"
                      checked={i.active}
                      onChange={(e) => edit(i.id, { active: e.target.checked })}
                    />
                    <span />
                  </label>

                  {/* Title & Category Button */}
                  <button
                    type="button"
                    className="erow__name"
                    onClick={() => setOpenId(open ? null : i.id)}
                    aria-expanded={open}
                  >
                    <b>{i.title}</b>
                    <em>
                      {catName.get(i.category_id) || i.category_id} · Qty: {i.fleet_qty}
                      {i.operator_available ? " · Operator Available" : ""}
                    </em>
                  </button>

                  {/* Availability Status Selector */}
                  <select
                    className="avail-select"
                    value={availStatus}
                    onChange={(e) => edit(i.id, { availability_status: e.target.value as AvailabilityStatus })}
                    style={{ marginInline: 8 }}
                  >
                    <option value="available">🟢 Available</option>
                    <option value="limited">🟡 Limited</option>
                    <option value="on_hire">🔴 On Hire</option>
                    <option value="maintenance">🔧 In Workshop</option>
                  </select>

                  <span className="erow__flags">
                    {!i.image_url && <span className="flag flag--warn">No image</span>}
                    {i.featured && <span className="flag" style={{ borderColor: "var(--amber)", color: "var(--amber)" }}>⭐ Featured</span>}
                    {i.ownership === "Managed" && <span className="flag">Managed</span>}
                    {!i.active && <span className="flag flag--off">Hidden</span>}
                  </span>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginLeft: "auto" }}>
                    <Link
                      href={`/equipment/item/${i.slug}`}
                      target="_blank"
                      className="btn btn--ghost btn--sm"
                      style={{ fontSize: "10.5px", padding: "5px 8px" }}
                      title="View live on website"
                    >
                      View ↗
                    </Link>
                    <button
                      type="button"
                      className="erow__toggle"
                      onClick={() => setOpenId(open ? null : i.id)}
                      aria-label={open ? "Collapse" : "Expand"}
                    >
                      {open ? "−" : "+"}
                    </button>
                  </div>
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
                        <span>Short description — used on cards and customer quotes</span>
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
                      <label className="f erow__check">
                        <input
                          type="checkbox"
                          checked={i.active}
                          onChange={(e) => edit(i.id, { active: e.target.checked })}
                        />
                        <span>Published on live site</span>
                      </label>
                    </div>

                    {/* Spec Builder & Preset Capability Badges */}
                    <div className="spec-builder">
                      <span className="afield__label">Capability Badges &amp; Spec Builder</span>
                      <p style={{ margin: "4px 0 8px", fontSize: 12, color: "var(--steel-lift)" }}>
                        Click preset tags below to toggle them for this machine, or type a custom badge:
                      </p>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                        {(i.specs_badges || []).map((badge) => (
                          <span key={badge} className="spec-active-badge">
                            {badge}
                            <button
                              type="button"
                              onClick={() => toggleBadge(i.id, badge)}
                              title="Remove badge"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="spec-presets">
                        {PRESET_BADGES.map((preset) => {
                          const isActive = (i.specs_badges || []).includes(preset);
                          return (
                            <button
                              key={preset}
                              type="button"
                              className="spec-preset-btn"
                              style={{
                                background: isActive ? "rgba(245,165,36,0.2)" : undefined,
                                borderColor: isActive ? "var(--amber)" : undefined,
                                color: isActive ? "#fff" : undefined,
                              }}
                              onClick={() => toggleBadge(i.id, preset)}
                            >
                              {isActive ? `✓ ${preset}` : `+ ${preset}`}
                            </button>
                          );
                        })}
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: 10, maxWidth: 380 }}>
                        <input
                          type="text"
                          placeholder="Type custom capability badge…"
                          value={customBadgeInputs[i.id] || ""}
                          onChange={(e) =>
                            setCustomBadgeInputs({ ...customBadgeInputs, [i.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomBadge(i.id);
                            }
                          }}
                          style={{
                            background: "var(--char2)",
                            border: "1px solid #3A3F45",
                            color: "#fff",
                            padding: "6px 10px",
                            borderRadius: 2,
                            fontSize: 12,
                            flex: 1,
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn--ghost"
                          style={{ padding: "6px 12px", fontSize: 11 }}
                          onClick={() => addCustomBadge(i.id)}
                        >
                          + Add
                        </button>
                      </div>
                    </div>

                    <div className="erow__img">
                      <span className="afield__label">Machine Photograph (Viewing Frame)</span>
                      <ImagePicker
                        value={i.image_url}
                        folder="equipment/"
                        itemTitle={i.title}
                        itemSlug={i.slug}
                        hint="Click to Move, Crop, Zoom & Pan inside the viewing frame."
                        onChange={(path) => edit(i.id, { image_url: path })}
                      />
                    </div>

                    <div
                      style={{
                        gridColumn: "1/-1",
                        marginTop: "12px",
                        paddingTop: "12px",
                        borderTop: "1px solid #22262c",
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        type="button"
                        className="btn btn--sm"
                        style={{
                          background: "rgba(220, 38, 38, 0.15)",
                          color: "#ef4444",
                          border: "1px solid rgba(239, 68, 68, 0.4)",
                        }}
                        onClick={() => handleDeleteItem(i)}
                      >
                        Delete Item
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Direct Image Framing Modal */}
      {editingImageItem && (
        <ImageEditorModal
          isOpen={true}
          onClose={() => setEditingImageItem(null)}
          onSave={(newPath) => {
            edit(editingImageItem.id, { image_url: newPath });
            setEditingImageItem(null);
          }}
          currentImageUrl={editingImageItem.image_url}
          folder="equipment/"
          itemTitle={editingImageItem.title}
          itemSlug={editingImageItem.slug}
        />
      )}

      {/* Category Reorder Modal */}
      {mounted &&
        showCatOrderModal &&
        createPortal(
          <div className="add-modal-backdrop" onClick={() => setShowCatOrderModal(false)}>
            <div
              className="add-modal"
              style={{ maxWidth: 540 }}
              onClick={(e) => e.stopPropagation()}
            >
              <header className="add-modal__head">
                <div>
                  <h2>Reorder Equipment Categories</h2>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--steel-lift)" }}>
                    Categories appear in this order on the Homepage fleet section and the catalogue page. Use the ▲ and ▼ buttons to prioritize.
                  </p>
                </div>
                <button
                  type="button"
                  className="add-modal__close"
                  onClick={() => setShowCatOrderModal(false)}
                >
                  ✕
                </button>
              </header>

              <div style={{ padding: "16px 24px", maxHeight: "60vh", overflowY: "auto" }}>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {cats.map((cat, idx) => (
                    <li
                      key={cat.id}
                      style={{
                        background: "var(--char)",
                        border: "1px solid var(--char2)",
                        borderRadius: 4,
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, color: "var(--amber)", fontSize: 14 }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>
                          {cat.title}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveCategory(idx, "up")}
                          style={{
                            background: "var(--char2)",
                            border: "1px solid #3A3F45",
                            color: idx === 0 ? "#555" : "#fff",
                            borderRadius: 3,
                            padding: "4px 10px",
                            cursor: idx === 0 ? "not-allowed" : "pointer",
                            fontWeight: 700,
                          }}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={idx === cats.length - 1}
                          onClick={() => moveCategory(idx, "down")}
                          style={{
                            background: "var(--char2)",
                            border: "1px solid #3A3F45",
                            color: idx === cats.length - 1 ? "#555" : "#fff",
                            borderRadius: 3,
                            padding: "4px 10px",
                            cursor: idx === cats.length - 1 ? "not-allowed" : "pointer",
                            fontWeight: 700,
                          }}
                        >
                          ▼
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <footer className="add-modal__foot">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setShowCatOrderModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={saveCategoryOrder}
                  disabled={savingCatOrder}
                >
                  {savingCatOrder ? "Saving Sequence…" : "Save Category Order"}
                </button>
              </footer>
            </div>
          </div>,
          document.body
        )}

      {/* Add New Equipment Modal */}
      {mounted &&
        showAddModal &&
        createPortal(
          <div className="add-modal-backdrop" onClick={() => setShowAddModal(false)}>
            <div className="add-modal" onClick={(e) => e.stopPropagation()}>
              <header className="add-modal__head">
                <div>
                  <h2>Add New Fleet Machinery</h2>
                  <p>Create a new machine entry. You can immediately crop, zoom, and adjust photo.</p>
                </div>
                <button
                  type="button"
                  className="add-modal__close"
                  onClick={() => setShowAddModal(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </header>

              <form onSubmit={handleCreateItem} className="add-modal__form">
                <label className="f">
                  <span>Machine Title *</span>
                  <input
                    required
                    placeholder="e.g. 15T Crane Truck (Hino 500 / Palfinger PK15500)"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <label className="f">
                    <span>Category *</span>
                    <select
                      value={newItem.category_id}
                      onChange={(e) => setNewItem({ ...newItem, category_id: e.target.value })}
                    >
                      {cats.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="f">
                    <span>URL Slug (Optional)</span>
                    <input
                      placeholder="auto-generated from title"
                      value={newItem.slug}
                      onChange={(e) => setNewItem({ ...newItem, slug: e.target.value })}
                    />
                  </label>
                </div>

                <label className="f">
                  <span>Short Description</span>
                  <textarea
                    rows={2}
                    placeholder="Key specifications, boom length, engine, application..."
                    value={newItem.short_description}
                    onChange={(e) => setNewItem({ ...newItem, short_description: e.target.value })}
                  />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <label className="f">
                    <span>Units in Fleet</span>
                    <input
                      type="number"
                      min={0}
                      value={newItem.fleet_qty}
                      onChange={(e) =>
                        setNewItem({ ...newItem, fleet_qty: Number(e.target.value) || 0 })
                      }
                    />
                  </label>

                  <label className="f">
                    <span>Ownership</span>
                    <select
                      value={newItem.ownership}
                      onChange={(e) => setNewItem({ ...newItem, ownership: e.target.value })}
                    >
                      <option value="Owned">Owned Fleet</option>
                      <option value="Managed">Managed Hire</option>
                    </select>
                  </label>

                  <label className="f">
                    <span>Status</span>
                    <select
                      value={newItem.availability_status}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          availability_status: e.target.value as AvailabilityStatus,
                        })
                      }
                    >
                      <option value="available">🟢 Available Now</option>
                      <option value="limited">🟡 Limited Stock</option>
                      <option value="on_hire">🔴 On Project Hire</option>
                      <option value="maintenance">🔧 In Workshop</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                  <label className="f erow__check">
                    <input
                      type="checkbox"
                      checked={newItem.operator_available}
                      onChange={(e) =>
                        setNewItem({ ...newItem, operator_available: e.target.checked })
                      }
                    />
                    <span>Operator Available</span>
                  </label>

                  <label className="f erow__check">
                    <input
                      type="checkbox"
                      checked={newItem.featured}
                      onChange={(e) => setNewItem({ ...newItem, featured: e.target.checked })}
                    />
                    <span>⭐ Pin as Featured Fleet</span>
                  </label>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <span className="afield__label">Initial Photo (Optional)</span>
                  <ImagePicker
                    value={newItem.image_url}
                    folder="equipment/"
                    itemTitle={newItem.title || "New Equipment"}
                    itemSlug={newItem.slug || "new-equipment"}
                    onChange={(path) => setNewItem({ ...newItem, image_url: path })}
                  />
                </div>

                <footer className="add-modal__foot">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn--primary" disabled={addingItem}>
                    {addingItem ? "Creating…" : "Create & Add to Catalogue"}
                  </button>
                </footer>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
