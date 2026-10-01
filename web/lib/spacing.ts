export interface SpacingConfig {
  // Tools Page
  toolsCategoryGap: number;
  toolsGroupGap: number;
  toolsGridGap: number;
  toolsHeroGap: number;
  toolsCalloutGap: number;

  // Global / Sections
  pageHeadPadding: number;
  heroBottomGap: number;
  sectionGap: number;
  cardGridGap: number;
  calloutMargin: number;
}

export const DEFAULT_SPACING: SpacingConfig = {
  toolsCategoryGap: 20,
  toolsGroupGap: 14,
  toolsGridGap: 8,
  toolsHeroGap: 24,
  toolsCalloutGap: 36,

  pageHeadPadding: 36,
  heroBottomGap: 40,
  sectionGap: 48,
  cardGridGap: 20,
  calloutMargin: 40,
};

export const SPACING_PRESETS: Record<string, { label: string; description: string; config: SpacingConfig }> = {
  compact: {
    label: "Compact",
    description: "Tight, high-density industrial layout with minimal wasted space.",
    config: {
      toolsCategoryGap: 14,
      toolsGroupGap: 10,
      toolsGridGap: 6,
      toolsHeroGap: 16,
      toolsCalloutGap: 20,
      pageHeadPadding: 26,
      heroBottomGap: 28,
      sectionGap: 36,
      cardGridGap: 14,
      calloutMargin: 28,
    },
  },
  balanced: {
    label: "Balanced (Default)",
    description: "Carefully calibrated rhythm with clear visual hierarchy.",
    config: DEFAULT_SPACING,
  },
  spacious: {
    label: "Spacious",
    description: "Generous breathing room and relaxed, modern open spacing.",
    config: {
      toolsCategoryGap: 32,
      toolsGroupGap: 20,
      toolsGridGap: 12,
      toolsHeroGap: 36,
      toolsCalloutGap: 56,
      pageHeadPadding: 52,
      heroBottomGap: 56,
      sectionGap: 64,
      cardGridGap: 26,
      calloutMargin: 56,
    },
  },
};

export function configToCssVariables(config: SpacingConfig): string {
  return `
    --spacing-tools-cat-gap: ${config.toolsCategoryGap}px;
    --spacing-tools-group-gap: ${config.toolsGroupGap}px;
    --spacing-tools-grid-gap: ${config.toolsGridGap}px;
    --spacing-tools-hero-gap: ${config.toolsHeroGap}px;
    --spacing-tools-callout-gap: ${config.toolsCalloutGap ?? DEFAULT_SPACING.toolsCalloutGap}px;
    --spacing-pagehead-gap: ${config.pageHeadPadding}px;
    --spacing-hero-gap: ${config.heroBottomGap}px;
    --spacing-section-gap: ${config.sectionGap}px;
    --spacing-grid-gap: ${config.cardGridGap}px;
    --spacing-callout-gap: ${config.calloutMargin}px;
  `.trim();
}
