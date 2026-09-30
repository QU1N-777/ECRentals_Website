import { getFirebaseAdmin } from "@/lib/firebase/server";
import EquipmentEditor from "./EquipmentEditor";
import BulkUpload, { type Target } from "@/components/admin/BulkUpload";

export const dynamic = "force-dynamic";

export default async function AdminEquipment() {
  try {
    const { db } = getFirebaseAdmin();
    const [itemsSnap, catsSnap, contentSnap] = await Promise.all([
      db.collection("equipment").orderBy("sort_order").get(),
      db.collection("equipment_categories").orderBy("sort_order").get(),
      db.collection("site_content").where("kind", "==", "image").get(),
    ]);

    const items = itemsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as any[];
    const cats = catsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as any[];
    const content = contentSnap.docs.map((d: any) => ({ key: d.id, ...d.data() })) as any[];

    // Everything a file can be matched against, keyed by the filename stem.
    const targets: Target[] = [
      ...items.map((i) => ({
        key: i.slug,
        path: `equipment/${i.slug}.webp`,
        apply: { table: "equipment" as const, id: i.id },
        label: i.title,
      })),
      ...cats.flatMap((c) => {
        // Category art shipped as cat-<something>.webp; accept the slug too.
        const keys = [`cat-${c.slug}`, c.slug];
        return keys.map((k) => ({
          key: k,
          path: `categories/cat-${c.slug}.webp`,
          apply: { table: "equipment_categories" as const, id: c.id },
          label: `${c.title} (category)`,
        }));
      }),
      ...content.map((c) => ({
        key: (c.value || c.key).replace(/^.*\//, "").replace(/\.[^.]+$/, ""),
        path: c.value || `${c.key}.webp`,
        apply: { table: "site_content" as const, key: c.key },
        label: c.label,
      })),
    ];

    return (
      <>
        <BulkUpload targets={targets} />
        <EquipmentEditor items={items} categories={cats} />
      </>
    );
  } catch (error: any) {
    return <p className="formerr">Could not load equipment: {error.message}</p>;
  }
}
