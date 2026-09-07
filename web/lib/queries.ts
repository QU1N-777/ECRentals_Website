import { cache } from "react";
import { supabasePublic } from "./supabase/server";
import type { Equipment, EquipmentCategory, Tool } from "./types";

const PUBLIC_EQUIPMENT_COLUMNS =
  "id,title,slug,category_id,short_description,specs,fleet_qty,ownership,operator_available,delivery_class,image_url,gallery,sort_order,active";

export const getCategories = cache(async (): Promise<EquipmentCategory[]> => {
  const { data, error } = await supabasePublic()
    .from("equipment_categories")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  if (error) throw new Error(`categories: ${error.message}`);
  return (data ?? []) as EquipmentCategory[];
});

export const getEquipment = cache(async (): Promise<Equipment[]> => {
  const { data, error } = await supabasePublic()
    .from("equipment")
    .select(PUBLIC_EQUIPMENT_COLUMNS)
    .eq("active", true)
    .order("sort_order");
  if (error) throw new Error(`equipment: ${error.message}`);
  return (data ?? []) as unknown as Equipment[];
});

export const getEquipmentBySlug = cache(async (slug: string) => {
  const { data, error } = await supabasePublic()
    .from("equipment")
    .select(`${PUBLIC_EQUIPMENT_COLUMNS},equipment_categories(title,slug)`)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) throw new Error(`equipment/${slug}: ${error.message}`);
  return data;
});

export const getTools = cache(async (): Promise<Tool[]> => {
  const { data, error } = await supabasePublic()
    .from("tools")
    .select("*")
    .eq("active", true)
    .order("title");
  if (error) throw new Error(`tools: ${error.message}`);
  return (data ?? []) as Tool[];
});

/** Live counts for the category cards — never hardcoded. */
export const getCategoryCounts = cache(async (): Promise<Map<string, number>> => {
  const equipment = await getEquipment();
  const counts = new Map<string, number>();
  for (const e of equipment) counts.set(e.category_id, (counts.get(e.category_id) ?? 0) + 1);
  return counts;
});
