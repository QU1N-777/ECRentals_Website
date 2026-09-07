const BUCKET = "site";

/**
 * Rows store bare paths ("categories/cat-earthmoving.webp"), so the bucket
 * can move without a data migration.
 */
export function img(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}
