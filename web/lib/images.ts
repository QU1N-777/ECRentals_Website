const BUCKET = "site";

/**
 * Resolve a stored image reference to something the browser can fetch.
 *
 * There are two sources, in priority order:
 *
 *   1. An absolute URL  -> used as-is. This is what the admin UI writes after
 *      an upload, so a picture swapped in /admin immediately overrides the
 *      bundled default without a deploy.
 *
 *   2. A bare path ("hero-home.webp", "equipment/case-cx220c-excavator.webp")
 *      -> served from /public/media, which ships with the app.
 *
 * Bundling the starter set matters: the site must never render blank frames
 * because a bucket happens to be empty or a key is missing. Storage is an
 * override, not a dependency.
 */
export function img(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return path;
  return `/media/${path}`;
}

/** Absolute public URL for an object in the storage bucket. */
export function storageUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

export { BUCKET };
