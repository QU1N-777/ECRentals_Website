import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/server";
import { checkAdmin } from "@/lib/firebase/session";
import { DEFAULT_SPACING, type SpacingConfig } from "@/lib/spacing";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { db } = getFirebaseAdmin();
    const doc = await db.collection("site_settings").doc("spacing").get();
    if (!doc.exists) {
      return NextResponse.json({ config: DEFAULT_SPACING });
    }
    const data = doc.data() as Partial<SpacingConfig>;
    return NextResponse.json({
      config: {
        ...DEFAULT_SPACING,
        ...data,
      },
    });
  } catch (err: any) {
    console.error("Failed to get spacing config:", err);
    return NextResponse.json({ config: DEFAULT_SPACING });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { isAdmin } = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const config: SpacingConfig = {
      toolsCategoryGap: Number(body.toolsCategoryGap) || DEFAULT_SPACING.toolsCategoryGap,
      toolsGroupGap: Number(body.toolsGroupGap) || DEFAULT_SPACING.toolsGroupGap,
      toolsGridGap: Number(body.toolsGridGap) || DEFAULT_SPACING.toolsGridGap,
      toolsHeroGap: Number(body.toolsHeroGap) || DEFAULT_SPACING.toolsHeroGap,
      toolsCalloutGap: Number(body.toolsCalloutGap) || DEFAULT_SPACING.toolsCalloutGap,
      pageHeadPadding: Number(body.pageHeadPadding) || DEFAULT_SPACING.pageHeadPadding,
      heroBottomGap: Number(body.heroBottomGap) || DEFAULT_SPACING.heroBottomGap,
      sectionGap: Number(body.sectionGap) || DEFAULT_SPACING.sectionGap,
      cardGridGap: Number(body.cardGridGap) || DEFAULT_SPACING.cardGridGap,
      calloutMargin: Number(body.calloutMargin) || DEFAULT_SPACING.calloutMargin,
    };

    const { db } = getFirebaseAdmin();
    await db.collection("site_settings").doc("spacing").set(config, { merge: true });

    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    console.error("Failed to save spacing config:", err);
    return NextResponse.json({ error: err.message || "Failed to save" }, { status: 500 });
  }
}
