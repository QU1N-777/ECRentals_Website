import { getFirebaseAdmin } from "@/lib/firebase/server";
import { DEFAULT_SPACING, type SpacingConfig } from "@/lib/spacing";
import SpacingStudio from "./SpacingStudio";

export const dynamic = "force-dynamic";

export default async function AdminSpacingPage() {
  let initialConfig: SpacingConfig = DEFAULT_SPACING;

  try {
    const { db } = getFirebaseAdmin();
    const doc = await db.collection("site_settings").doc("spacing").get();
    if (doc.exists) {
      initialConfig = {
        ...DEFAULT_SPACING,
        ...(doc.data() as Partial<SpacingConfig>),
      };
    }
  } catch (e) {
    console.error("Failed to load spacing settings:", e);
  }

  return <SpacingStudio initialConfig={initialConfig} />;
}
