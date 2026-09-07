/**
 * Hand-maintained view of the tables this app reads.
 * Regenerate the full set any time with:  npm run types
 */
export type EquipmentCategory = {
  id: string;
  title: string;
  slug: string;
  benefit_line: string | null;
  description: string | null;
  image_url: string | null;
  icon_url: string | null;
  sort_order: number;
  active: boolean;
};

/**
 * Note there is no `fleet_numbers` here, and that is deliberate.
 * A column-level GRANT keeps it out of the public API entirely, so the
 * anon client cannot select it even if asked. Internal metadata only.
 */
export type Equipment = {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  short_description: string | null;
  specs: string | null;
  fleet_qty: number;
  ownership: "Owned" | "Managed";
  operator_available: boolean;
  delivery_class: "Light" | "Standard" | "Heavy" | null;
  image_url: string | null;
  gallery: string[];
  sort_order: number;
  active: boolean;
};

export type EquipmentWithCategory = Equipment & {
  equipment_categories: Pick<EquipmentCategory, "title" | "slug"> | null;
};

export type Tool = {
  id: string;
  title: string;
  slug: string;
  tool_category: string;
  active: boolean;
};

export type SiteContent = {
  key: string;
  kind: "text" | "richtext" | "image" | "url" | "number";
  value: string | null;
  label: string;
  group_name: string;
  help: string | null;
  sort_order: number;
};

export type BasketLine = {
  equipmentId: string;
  slug: string;
  title: string;
  qty: number;
  days: number;
  requiredFrom: string | null;
};

/** Split the pipe-delimited specs field for render. */
export const splitSpecs = (specs: string | null): string[] =>
  specs ? specs.split("|").map((s) => s.trim()).filter(Boolean) : [];
