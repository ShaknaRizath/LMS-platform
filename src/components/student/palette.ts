// Shared pastel palette for the student dashboard, matching the reference swatch:
// pale blue -> teal -> light green -> pale mint -> periwinkle (from the "Cosmic Blues"
// swatch) -> steel blue-gray -> deep navy (both from a later 6-shade blue ramp). `bg`/`fg`
// pairs are pre-matched for contrast; `accent` is a more saturated version of the same hue
// for rings/bars/dots. Newer entries are always appended, never inserted — existing
// hardcoded index lookups (e.g. course status colors) stay pointed at the same hues.
export const STUDENT_PALETTE = [
  { bg: "#B7E4F7", fg: "#0E7093", accent: "#3FA9D6" },
  { bg: "#9AD9E3", fg: "#0B5866", accent: "#3EA9BB" },
  { bg: "#BDECC7", fg: "#276B3B", accent: "#4FB86B" },
  { bg: "#CFFBEA", fg: "#187A5E", accent: "#2FBE95" },
  { bg: "#C7D2FE", fg: "#3730A3", accent: "#4F46E5" },
  { bg: "#DCE3F2", fg: "#3A5478", accent: "#4E76AA" },
  { bg: "#C3D4EE", fg: "#0B3F7A", accent: "#1B5FA6" },
] as const;
