import { supabaseSession } from "@/lib/supabase/session";
import EquipmentEditor from "./EquipmentEditor";
import BulkUpload, { type Target } from "@/components/admin/BulkUpload";

export const dynamic = "force-dynamic";

export default async function AdminEquipment() {
  const supabase = await supabaseSession();
  const [{ data: items, error }, { data: cats }, { data: content }] = await Promise.all([
    supabase
      .from("equipment")
      .select(
        "id,title,slug,category_id,short_description,fleet_qty,ownership,operator_available,delivery_class,image_url,sort_order,active"
      )
      .order("sort_order"),
    supabase.from("equipment_categories").select("id,title,slug").order("sort_order"),
    supabase.from("site_content").select("key,value,label").eq("kind", "image"),
  ]);

  if (error) {
    return <p className="formerr">Could not load equipment: {error.message}</p>;
  }

  // Everything a file can be matched against, keyed by the filename stem.
  const targets: Target[] = [
    ...(items ?? []).map((i) => ({
      key: i.slug,
      path: `equipment/${i.slug}.webp`,
      apply: { table: "equipment" as const, id: i.id },
      label: i.title,
    })),
    ...(cats ?? []).flatMap((c) => {
      // Category art shipped as cat-<something>.webp; accept the slug too.
      const keys = [`cat-${c.slug}`, c.slug];
      return keys.map((k) => ({
        key: k,
        path: `categories/cat-${c.slug}.webp`,
        apply: { table: "equipment_categories" as const, id: c.id },
        label: `${c.title} (category)`,
      }));
    }),
    ...(content ?? []).map((c) => ({
      key: (c.value || c.key).replace(/^.*\//, "").replace(/\.[^.]+$/, ""),
      path: c.value || `${c.key}.webp`,
      apply: { table: "site_content" as const, key: c.key },
      label: c.label,
    })),
  ];

  return (
    <>
      <BulkUpload targets={targets} />
      <EquipmentEditor items={items ?? []} categories={cats ?? []} />
    </>
  );
}
