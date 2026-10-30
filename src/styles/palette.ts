/**
 * INK + BLUE — the single source of truth for colour in JS. The CSS custom
 * properties in `src/app/globals.css` mirror these values one-to-one;
 * change both together.
 */

export const blue = {
  50: "#EFF8FF",
  100: "#D9F0FF",
  200: "#B9E3FF",
  300: "#7CC9FF",
  400: "#3AA9FF",
  500: "#0794F9",
  600: "#0086F0",
  700: "#0079E8",
  800: "#0068CC",
  900: "#0055A8",
  950: "#003B75",
} as const;

export const ink = {
  light: { background: "#FFFFFF", primary: "#111111", surface: "#F4F4F4" },
  dark: { background: "#0A0A0A", primary: "#F5F5F5", surface: "#111111" },
} as const;

export type ThemeName = "light" | "dark";

/**
 * The two sides of every product. FRONT is the light world people see;
 * BACK is the dark world that makes it run. Accents follow the contrast
 * rule: on white only BLUE 800+ is text-safe, on dark only BLUE 700-.
 */
export const sides = {
  front: { ...ink.light, accent: blue[800], highlight: blue[900] },
  back: { ...ink.dark, accent: blue[400], highlight: blue[300] },
} as const;

export const brandSurface = {
  deep: blue[950],
  medium: blue[800],
  bright: blue[400],
} as const;

/** Code editor syntax — blue scale only */
export const codeEditor = {
  light: { keyword: blue[900], string: blue[800], property: blue[950], punctuation: "#111111", comment: "#6B6B6B" },
  dark: { keyword: blue[300], string: blue[400], property: blue[200], punctuation: "#F5F5F5", comment: "#8A8A8A" },
} as const;
