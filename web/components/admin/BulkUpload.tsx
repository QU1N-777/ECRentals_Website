"use client";

import { useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

const BUCKET = "site";

type Target = {
  /** filename stem that identifies this target, e.g. "case-cx220c-excavator" */
  key: string;
  /** where it lands in the bucket, e.g. "equipment/case-cx220c-excavator.webp" */
  path: string;
  /** how to record it once uploaded */
  apply: { table: "equipment"; id: string } | { table: "site_content"; key: string } | { table: "equipment_categories"; id: string };
  label: string;
};

type Result = { file: string; status: "ok" | "skip" | "fail"; note: string };

/**
 * Select a folder of images and have them wire themselves up.
 *
 * Files are matched to targets by filename stem, so "case-cx220c-excavator.webp"
 * finds the Case CX220C row without anyone choosing it from a dropdown. Anything
 * unmatched is reported rather than silently dropped.
 */
export default function BulkUpload({ targets }: { targets: Target[] }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [results, setResults] = useState<Result[]>([]);
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const stem = (name: string) =>
    name.toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  async function run(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;

    setBusy(true);
    setResults([]);
    setProgress({ done: 0, total: list.length });

    const supabase = supabaseBrowser();
    const index = new Map(targets.map((t) => [t.key, t]));
    const out: Result[] = [];

    for (const file of list) {
      const s = stem(file.name);
      const target = index.get(s);

      if (!target) {
        out.push({ file: file.name, status: "skip", note: "No matching item — filename must equal the slug" });
        setProgress((p) => ({ ...p, done: p.done + 1 }));
        setResults([...out]);
        continue;
      }

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(target.path, file, { upsert: true, cacheControl: "31536000", contentType: file.type });

      if (upErr) {
        out.push({
          file: file.name,
          status: "fail",
          note: /row-level security|not authorized/i.test(upErr.message)
            ? "Refused — your account is not an admin"
            : upErr.message,
        });
        setProgress((p) => ({ ...p, done: p.done + 1 }));
        setResults([...out]);
        continue;
      }

      const a = target.apply;
      const { error: dbErr } =
        a.table === "site_content"
          ? await supabase.from("site_content").update({ value: target.path }).eq("key", a.key)
          : a.table === "equipment"
            ? await supabase.from("equipment").update({ image_url: target.path }).eq("id", a.id)
            : await supabase.from("equipment_categories").update({ image_url: target.path }).eq("id", a.id);

      out.push({
        file: file.name,
        status: dbErr ? "fail" : "ok",
        note: dbErr ? `Uploaded, but the record did not update: ${dbErr.message}` : target.label,
      });
      setProgress((p) => ({ ...p, done: p.done + 1 }));
      setResults([...out]);
    }

    setBusy(false);
  }

  const ok = results.filter((r) => r.status === "ok").length;
  const skipped = results.filter((r) => r.status === "skip").length;
  const failed = results.filter((r) => r.status === "fail").length;

  return (
    <section className="bulk">
      <div className="bulk__head">
        <div>
          <h2>Bulk image upload</h2>
          <p>
            Select or drop many files at once. Each one is matched to an item by its filename —
            <code> case-cx220c-excavator.webp</code> finds the Case CX220C. Existing images are
            replaced. {targets.length} slots can be filled this way.
          </p>
        </div>
      </div>

      <div
        className={`bulk__drop${over ? " is-over" : ""}${busy ? " is-busy" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); void run(e.dataTransfer.files); }}
        onClick={() => !busy && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !busy) { e.preventDefault(); inputRef.current?.click(); }
        }}
      >
        {busy ? (
          <>
            <b>Uploading {progress.done} of {progress.total}…</b>
            <div className="bulk__bar">
              <span style={{ width: `${(progress.done / Math.max(1, progress.total)) * 100}%` }} />
            </div>
          </>
        ) : (
          <>
            <b>Drop images here, or click to choose</b>
            <span>WebP, JPEG, PNG or AVIF · up to 8 MB each</span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) void run(e.target.files);
          e.target.value = "";
        }}
      />

      {results.length > 0 && (
        <>
          <p className="bulk__summary">
            <b className="ok">{ok} matched and saved</b>
            {skipped > 0 && <b className="skip">{skipped} unmatched</b>}
            {failed > 0 && <b className="fail">{failed} failed</b>}
          </p>
          <ul className="bulk__list">
            {results.map((r, i) => (
              <li key={`${r.file}-${i}`} className={`bulk__r bulk__r--${r.status}`}>
                <code>{r.file}</code>
                <span>{r.note}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export type { Target };
