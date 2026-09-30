"use client";

import { useRef, useState } from "react";
import ImageEditorModal from "./ImageEditorModal";

const MAX_BYTES = 12 * 1024 * 1024;
const OK_TYPES = ["image/webp", "image/jpeg", "image/png", "image/avif", "image/svg+xml"];

export default function ImagePicker({
  value,
  folder = "equipment/",
  onChange,
  hint,
  itemTitle = "Equipment",
  itemSlug = "equipment",
}: {
  value: string | null;
  folder?: string;
  onChange: (path: string) => void;
  hint?: string;
  itemTitle?: string;
  itemSlug?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = value
    ? value.startsWith("http")
      ? value
      : `/media/${value}`
    : null;

  async function directUpload(file: File) {
    setErr(null);

    if (!OK_TYPES.includes(file.type)) {
      setErr("Use a WebP, JPEG, PNG, or AVIF file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setErr(`File size is ${(file.size / 1024 / 1024).toFixed(1)} MB. Max limit is 12 MB.`);
      return;
    }

    setBusy(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      onChange(data.url);
    } catch (e: any) {
      setErr(e.message || "Failed to upload image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ipick">
      <div
        className={`ipick__drop${over ? " is-over" : ""}${busy ? " is-busy" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void directUpload(f);
        }}
        onClick={() => setModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setModalOpen(true);
          }
        }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="ipick__img" />
        ) : (
          <span className="ipick__empty">No image set</span>
        )}
        <span className="ipick__overlay">
          {busy ? "Uploading…" : preview ? "Click to Move, Zoom & Frame" : "Click or Drop to Add Photo"}
        </span>
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          style={{ fontSize: "11px", padding: "6px 10px" }}
          onClick={() => setModalOpen(true)}
        >
          📐 Frame, Crop & Zoom
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          style={{ fontSize: "11px", padding: "6px 10px" }}
          onClick={() => inputRef.current?.click()}
        >
          Quick Upload File
        </button>
        {value && (
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            style={{ fontSize: "11px", padding: "6px 10px", color: "#ef4444" }}
            onClick={() => onChange("")}
          >
            Clear
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={OK_TYPES.join(",")}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void directUpload(f);
          e.target.value = "";
        }}
      />

      <p className="ipick__path">{value || "No image assigned"}</p>
      {hint && !err && <p className="ipick__hint">{hint}</p>}
      {err && <p className="ipick__err" role="alert">{err}</p>}

      {/* Interactive Move, Crop, Zoom & Pan Editor Modal */}
      <ImageEditorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentImageUrl={value}
        itemTitle={itemTitle}
        itemSlug={itemSlug}
        folder={folder}
        onSave={(newUrl) => onChange(newUrl)}
      />
    </div>
  );
}
