// Cats Can Dance — design tokens & theme presets
// All colors are stored as raw HSL strings (e.g. "0 72% 51%") so they can be
// dropped straight into `hsl(var(--token))` in CSS.

export type ThemeTokens = {
  brand: string;       // primary brand color (used for hero accents, drops, etc.)
  accent: string;      // secondary highlight (CTAs, eyebrows)
  surface: string;     // light section background
  surfaceAlt: string;  // dark section background
  onBrand: string;     // text color on brand bg
  onSurface: string;   // text color on surface bg
  shadow: string;      // chunk-shadow color
};

export type ThemePreset = {
  id: string;
  label: string;
  description: string;
  tokens: ThemeTokens;
};

export const THEME_PRESETS: Record<string, ThemePreset> = {
  default: {
    id: "default",
    label: "Default",
    description: "Magenta · acid-yellow · cream · ink",
    tokens: {
      brand: "0 72% 51%",        // magenta
      accent: "84 81% 56%",      // acid-yellow
      surface: "20 6% 90%",      // cream
      surfaceAlt: "222 47% 4%",  // ink
      onBrand: "20 6% 90%",      // cream
      onSurface: "222 47% 4%",   // ink
      shadow: "222 47% 4%",      // ink
    },
  },
  midnight: {
    id: "midnight",
    label: "Midnight",
    description: "Electric blue · lime · ink · cream",
    tokens: {
      brand: "221 83% 53%",      // electric-blue
      accent: "142 76% 73%",     // lime
      surface: "222 47% 8%",     // near-ink
      surfaceAlt: "222 47% 4%",  // ink
      onBrand: "20 6% 90%",      // cream
      onSurface: "20 6% 90%",    // cream
      shadow: "0 0% 0%",
    },
  },
  sunburn: {
    id: "sunburn",
    label: "Sunburn",
    description: "Orange · acid-yellow · cream · ink",
    tokens: {
      brand: "21 90% 53%",       // orange
      accent: "84 81% 56%",      // acid-yellow
      surface: "20 6% 90%",      // cream
      surfaceAlt: "222 47% 4%",  // ink
      onBrand: "222 47% 4%",     // ink
      onSurface: "222 47% 4%",   // ink
      shadow: "222 47% 4%",
    },
  },
};

export const DEFAULT_THEME = THEME_PRESETS.default;

export type ThemeConfig = {
  preset: string;
  overrides?: Partial<ThemeTokens>;
};

export const resolveTheme = (config?: ThemeConfig | null): ThemeTokens => {
  const preset = (config?.preset && THEME_PRESETS[config.preset]) || DEFAULT_THEME;
  return { ...preset.tokens, ...(config?.overrides ?? {}) };
};

export const applyTheme = (tokens: ThemeTokens) => {
  const root = document.documentElement;
  root.style.setProperty("--brand", tokens.brand);
  root.style.setProperty("--accent", tokens.accent);
  root.style.setProperty("--surface", tokens.surface);
  root.style.setProperty("--surface-alt", tokens.surfaceAlt);
  root.style.setProperty("--on-brand", tokens.onBrand);
  root.style.setProperty("--on-surface", tokens.onSurface);
  root.style.setProperty("--shadow", tokens.shadow);
};
