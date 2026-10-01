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
  const p = path.trim();
  if (!p) return null;

  // If it's an absolute URL
  if (p.startsWith("http://") || p.startsWith("https://")) {
    // If it's a known starter asset stored with a storage URL, serve from local bundled media
    if (p.includes("firebasestorage.googleapis.com") || p.includes("storage.googleapis.com")) {
      const match = p.match(/\/o\/([^?]+)/);
      if (match && match[1]) {
        const decoded = decodeURIComponent(match[1]);
        const filename = decoded.split("/").pop();
        if (
          filename &&
          ["hero-home.webp", "cta-fleet.webp", "managed-hire.webp", "operators.webp"].includes(filename)
        ) {
          return `/media/${filename}`;
        }
      }
    }
    return p;
  }

  if (p.startsWith("/")) return p;
  if (p.startsWith("media/")) return `/${p}`;
  return `/media/${p}`;
}

/** Absolute public URL for an object in the storage bucket. */
export function storageUrl(path: string): string {
  const bucket = `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebasestorage.app`;
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
}

export { BUCKET };
