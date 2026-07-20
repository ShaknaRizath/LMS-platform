// Shared palette for the Admin dashboard, matching the reference swatch: light blue ->
// navy -> gold/tan -> light peach -> dark brown -> blue-purple. `bg`/`fg` pairs are light
// tints with a matched dark-text color (same pastel-tile convention as STUDENT_PALETTE /
// LECTURER_PALETTE); `accent` is the swatch's own more saturated hue.
export const ADMIN_PALETTE = [
  { bg: "#DCE6F5", fg: "#2B3252", accent: "#6D7DBB" },
  { bg: "#F3E3CB", fg: "#6B4A1E", accent: "#C79966" },
  { bg: "#EAD9C4", fg: "#4A3420", accent: "#8A6339" },
  { bg: "#E1E3EC", fg: "#1E2340", accent: "#2B3252" },
  { bg: "#F7E4CC", fg: "#7A4E1E", accent: "#E0B37E" },
] as const;
