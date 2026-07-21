// Shared palette for the Program Coordinator dashboard, blending the reference swatches:
// "Cosmic Blues" (vivid blue -> periwinkle -> indigo -> navy) and "Soft Whisper" (muted
// slate-blue), the same way ACADEMIC_PALETTE blends two source swatches into 4 non-repeating
// hues (see src/components/academic/palette.ts). `bg` is a visibly-blue pastel tile (matched
// in saturation to ACADEMIC_PALETTE's FFCAD4-family, not a near-white wash), `fg` a matched
// dark-text color, and `accent` a punchier version of the same hue for icons/rings/charts.
export const COORDINATOR_PALETTE = [
  { bg: "#C7C2FF", fg: "#22187E", accent: "#2B1FFF" },
  { bg: "#BCC6FE", fg: "#2B3170", accent: "#6B7EF5" },
  { bg: "#C7CDF2", fg: "#232C57", accent: "#4356C4" },
  { bg: "#CBCFDA", fg: "#2B3142", accent: "#5D6685" },
] as const;
