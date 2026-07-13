// Shared pastel palette for the student dashboard, matching the reference swatch:
// pale blue -> teal -> light green -> pale mint. `bg`/`fg` pairs are pre-matched for
// contrast; `accent` is a more saturated version of the same hue for rings/bars/dots.
export const STUDENT_PALETTE = [
  { bg: "#B7E4F7", fg: "#0E7093", accent: "#3FA9D6" },
  { bg: "#9AD9E3", fg: "#0B5866", accent: "#3EA9BB" },
  { bg: "#BDECC7", fg: "#276B3B", accent: "#4FB86B" },
  { bg: "#CFFBEA", fg: "#187A5E", accent: "#2FBE95" },
] as const;
