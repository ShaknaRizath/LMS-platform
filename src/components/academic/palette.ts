// Shared palette for the Academic Director dashboard, matching the reference swatch: pink ->
// magenta -> coral -> orange. Unlike the earlier "Vintage Rose" swatch (all near-identical pale
// tints, hard to tell cards apart), each entry here uses a genuinely distinct hue as `bg` so
// stat tiles/icons read as separate colors at a glance, with a matched dark-text `fg` and a
// more saturated `accent` of the same hue for rings/icons/charts.
export const ACADEMIC_PALETTE = [
  { bg: "#FFCAD4", fg: "#8A1F35", accent: "#FF8FA3" },
  { bg: "#FFA8E0", fg: "#7A1B5C", accent: "#FF6FD3" },
  { bg: "#FF9E90", fg: "#7A2A1C", accent: "#FF7A66" },
  { bg: "#F5A374", fg: "#6B3410", accent: "#EF7C4B" },
] as const;
