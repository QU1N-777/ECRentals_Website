/**
 * Loads every available image into the `site` bucket, in the exact paths the
 * database already points at.
 *
 *   Images/site-ready/cat-*.webp   ->  categories/cat-*.webp   (category cards)
 *   Images/site-ready/*.webp       ->  *.webp                  (hero, CTA, splits)
 *   Images/web-optimised/*.webp    ->  equipment/<slug>.webp   (fleet photos)
 *
 * Needs the service-role key, which bypasses RLS — that is why this runs from
 * your machine and never from the browser or a deployed route.
 *
 *   1. Supabase dashboard -> Project Settings -> API -> service_role -> copy
 *   2. Paste into web/.env.local as SUPABASE_SERVICE_ROLE_KEY=...
 *   3. node scripts/upload-images.mjs
 *
 * Safe to re-run: everything is upserted, never duplicated.
 */
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ENV = join(process.cwd(), ".env.local");
for (const line of (await readFile(ENV, "utf8").catch(() => "")).split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) {
  console.error("\n  SUPABASE_SERVICE_ROLE_KEY is not set in web/.env.local.");
  console.error("  Supabase dashboard -> Project Settings -> API -> service_role\n");
  process.exit(1);
}
console.log(`\n  Target: ${URL}\n  Bucket: site\n`);

const IMAGES = resolve(process.cwd(), "..", "Images");
const BUCKET = "site";
const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

/** folder on disk -> function mapping a filename to its path in the bucket */
const SOURCES = [
  {
    dir: join(IMAGES, "site-ready"),
    label: "page images",
    to: (f) => (f.startsWith("cat-") ? `categories/${f}` : f),
  },
  {
    dir: join(IMAGES, "web-optimised"),
    label: "fleet photos",
    to: (f) => `equipment/${f}`,
  },
];

let ok = 0;
let failed = 0;
const uploaded = [];

for (const src of SOURCES) {
  if (!existsSync(src.dir)) {
    console.log(`  skip  ${src.label} — ${src.dir} not found\n`);
    continue;
  }
  const files = (await readdir(src.dir)).filter((f) => /\.(webp|jpe?g|png|avif)$/i.test(f)).sort();
  console.log(`  ${src.label} — ${files.length} file${files.length === 1 ? "" : "s"}`);

  for (const file of files) {
    const body = await readFile(join(src.dir, file));
    const path = src.to(file);
    const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
      contentType: file.toLowerCase().endsWith(".webp")
        ? "image/webp"
        : file.toLowerCase().endsWith(".png")
          ? "image/png"
          : file.toLowerCase().endsWith(".avif")
            ? "image/avif"
            : "image/jpeg",
      cacheControl: "31536000",
      upsert: true,
    });
    if (error) {
      failed++;
      console.log(`    FAIL  ${path.padEnd(52)} ${error.message}`);
    } else {
      ok++;
      uploaded.push(path);
      console.log(`    ok    ${path.padEnd(52)} ${(body.length / 1024) | 0} KB`);
    }
  }
  console.log("");
}

// Point any equipment row at its photo where one actually landed.
const fleet = new Set(uploaded.filter((p) => p.startsWith("equipment/")));
if (fleet.size) {
  const { data: rows } = await supabase.from("equipment").select("id,slug,image_url");
  let wired = 0;
  for (const r of rows ?? []) {
    const expected = `equipment/${r.slug}.webp`;
    if (fleet.has(expected) && r.image_url !== expected) {
      const { error } = await supabase.from("equipment").update({ image_url: expected }).eq("id", r.id);
      if (!error) wired++;
    }
  }
  console.log(`  wired ${wired} equipment record${wired === 1 ? "" : "s"} to a photo`);
}

const { data: listed } = await supabase.storage.from(BUCKET).list("", { limit: 100 });
console.log(`\n  ${ok} uploaded, ${failed} failed. Bucket root now holds ${listed?.length ?? 0} entries.\n`);
process.exit(failed ? 1 : 0);
