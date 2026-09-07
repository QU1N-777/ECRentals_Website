"use client";

import { useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

const BUCKET = "site";
const MAX_BYTES = 8 * 1024 * 1024;
const OK_TYPES = ["image/webp", "image/jpeg", "image/png", "image/avif", "image/svg+xml"];

/**
 * Drag-and-drop image replacement.
 *
 * Uploads run as the signed-in admin against a storage RLS policy — there is
 * no service-role key in the browser. The database stores a bare path, so the
 * bucket can move without a data migration.
 */
export default function ImagePicker({
  value,
  folder = "",
  onChange,
  hint,
}: {
  value: string | null;
  /** e.g. "categories/" or "equipment/" */
  folder?: string;
  onChange: (path: string) => void;
  hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [bust, setBust] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const preview = value
    ? (value.startsWith("http") ? value : `/media/${value}`) + (bust ? `?v=${bust}` : "")
    : null;

  async function upload(file: File) {
    setErr(null);

    if (!OK_TYPES.includes(file.type)) {
      setErr("Use a WebP, JPEG, PNG, AVIF or SVG file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setErr(`That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 8 MB.`);
      return;
    }

    setBusy(true);
    // Keep the existing path when replacing, so nothing else needs updating.
    const existing = value?.includes(`/public/${BUCKET}/`)
      ? value.split(`/public/${BUCKET}/`)[1].split("?")[0]
      : value && !value.startsWith("http")
        ? value
        : null;
    const path =
      existing ??
      (folder +
          file.name
            .toLowerCase()
            .replace(/\.[^.]+$/, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") +
          "." +
          (file.name.split(".").pop() ?? "webp").toLowerCase());

    const { error } = await supabaseBrowser()
      .storage.from(BUCKET)
      .upload(path, file, { upsert: true, cacheControl: "31536000", contentType: file.type });

    setBusy(false);

    if (error) {
      setErr(
        /row-level security|not authorized/i.test(error.message)
          ? "Upload refused — your account is not on the admin allowlist."
          : error.message
      );
      return;
    }
    setBust(Date.now());
    // absolute URL, so it wins over the bundled /media default
    onChange(`${base}/storage/v1/object/public/${BUCKET}/${path}`);
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
          if (f) void upload(f);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="ipick__img" />
        ) : (
          <span className="ipick__empty">No image yet</span>
        )}
        <span className="ipick__overlay">{busy ? "Uploading…" : "Drop a file or click"}</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={OK_TYPES.join(",")}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
          e.target.value = "";
        }}
      />

      <p className="ipick__path">{value || "—"}</p>
      {hint && !err && <p className="ipick__hint">{hint}</p>}
      {err && <p className="ipick__err" role="alert">{err}</p>}
    </div>
  );
}
