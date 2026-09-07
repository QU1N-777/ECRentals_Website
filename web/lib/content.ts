import { cache } from "react";
import { supabasePublic } from "./supabase/server";
import type { SiteContent } from "./types";

/**
 * Every editable string and image on the site lives in `site_content`,
 * so copy and photography change without a deploy.
 * Cached per request so one page render costs one query.
 */
export const getContent = cache(async (): Promise<Map<string, string>> => {
  const { data, error } = await supabasePublic()
    .from("site_content")
    .select("key,value");
  if (error) {
    console.error("site_content load failed:", error.message);
    return new Map();
  }
  return new Map((data ?? []).map((r) => [r.key, r.value ?? ""]));
});

/** Fall back to the supplied default so a missing row never renders empty. */
export function t(map: Map<string, string>, key: string, fallback = ""): string {
  const v = map.get(key);
  return v && v.trim() ? v : fallback;
}

/** Pipe-delimited list fields, e.g. the trust band. */
export function list(map: Map<string, string>, key: string, fallback: string[] = []): string[] {
  const v = map.get(key);
  if (!v) return fallback;
  const parts = v.split("|").map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : fallback;
}

export type { SiteContent };
