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
  // If a Firebase Storage URL was stored in the database, extract the bare filename
  // so it maps to the bundled starter set in /media/
  if (path.includes("firebasestorage.googleapis.com")) {
    const match = path.match(/\/o\/([^?]+)/);
    if (match && match[1]) {
      const decoded = decodeURIComponent(match[1]);
      return `/media/${decoded}`;
    }
  }
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return path;
  return `/media/${path}`;
}

/** Absolute public URL for an object in the storage bucket. */
export function storageUrl(path: string): string {
  const bucket = `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebasestorage.app`;
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
}

export { BUCKET };
