import { cache } from "react";
import { getFirebaseAdmin } from "./firebase/server";
import type { Equipment, EquipmentCategory, Tool } from "./types";

export const getCategories = cache(async (): Promise<EquipmentCategory[]> => {
  const { db } = getFirebaseAdmin();
  const snapshot = await db.collection("equipment_categories")
    .where("active", "==", true)
    .orderBy("sort_order")
    .get();
  return snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() })) as EquipmentCategory[];
});

export const getEquipment = cache(async (): Promise<Equipment[]> => {
  const { db } = getFirebaseAdmin();
  const snapshot = await db.collection("equipment")
    .where("active", "==", true)
    .orderBy("sort_order")
    .get();
  return snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() })) as unknown as Equipment[];
});

export const getEquipmentBySlug = cache(async (slug: string) => {
  const { db } = getFirebaseAdmin();
  const snapshot = await db.collection("equipment")
    .where("slug", "==", slug)
    .where("active", "==", true)
    .limit(1)
    .get();
    
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  const data = { id: doc.id, ...doc.data() } as any;
  
  if (data.category_id) {
    const catDoc = await db.collection("equipment_categories").doc(data.category_id).get();
    if (catDoc.exists) {
      data.equipment_categories = { title: catDoc.data()?.title, slug: catDoc.data()?.slug };
    }
  }
  return data;
});

export const getTools = cache(async (): Promise<Tool[]> => {
  const { db } = getFirebaseAdmin();
  const snapshot = await db.collection("tools")
    .where("active", "==", true)
    .orderBy("title")
    .get();
  return snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() })) as Tool[];
});

/** Live counts for the category cards — never hardcoded. */
export const getCategoryCounts = cache(async (): Promise<Map<string, number>> => {
  const equipment = await getEquipment();
  const counts = new Map<string, number>();
  for (const e of equipment) counts.set(e.category_id, (counts.get(e.category_id) ?? 0) + 1);
  return counts;
});

