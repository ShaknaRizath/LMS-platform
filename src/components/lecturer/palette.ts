// Shared palette for the lecturer dashboard, matching the reference swatch: deep purple ->
// mauve pink -> peach cream -> periwinkle indigo -> dusty pink. `bg`/`fg` pairs are light
// tints with a matched dark-text color (same pastel-tile convention as STUDENT_PALETTE);
// `accent` is the swatch's own more saturated hue, for rings/icons/bars.
export const LECTURER_PALETTE = [
  { bg: "#E6DBF3", fg: "#5B3B82", accent: "#6B4593" },
  { bg: "#F6DCEE", fg: "#8E3D6E", accent: "#C97FB4" },
  { bg: "#FDE7CD", fg: "#92601F", accent: "#F0B36B" },
  { bg: "#E2E2F6", fg: "#3D3F97", accent: "#7376C0" },
  { bg: "#F1E1EC", fg: "#7C4C73", accent: "#D3AACB" },
] as const;
