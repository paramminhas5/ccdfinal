// Cats Can Dance — design tokens & theme presets
// All colors are stored as raw HSL strings (e.g. "0 72% 51%") so they can be
// dropped straight into `hsl(var(--token))` in CSS.

export type ThemeTokens = {
  brand: string;
  accent: string;
  surface: string;
  surfaceAlt: string;
  onBrand: string;
  onSurface: string;
  shadow: string;
};

// Full named-palette overrides — these remap the existing bg-magenta /
// bg-cream / bg-ink / bg-acid-yellow / bg-electric-blue / bg-orange / bg-lime
// classes used across the entire site, so a preset re-skins everything
// without touching component code.
export type PaletteOverrides = Partial<{
  magenta: string;
  cream: string;
  ink: string;
  acidYellow: string;
  electricBlue: string;
  orange: string;
  lime: string;
  hotPink: string;
  bubblegum: string;
}>;

export type ThemePreset = {
  id: string;
  label: string;
  description: string;
  tokens: ThemeTokens;
  palette?: PaletteOverrides;
};

// Original palette — used as the fallback baseline so partial preset overrides
// never leave a slot undefined.
const BASE_PALETTE = {
  magenta: "0 72% 51%",
  cream: "20 6% 90%",
  ink: "222 47% 4%",
  acidYellow: "84 81% 56%",
  electricBlue: "221 83% 53%",
  orange: "21 90% 53%",
  lime: "142 76% 73%",
  hotPink: "0 72% 51%",
  bubblegum: "0 93% 86%",
};

export const THEME_PRESETS: Record<string, ThemePreset> = {
  default: {
    id: "default",
    label: "Default",
    description: "Magenta · acid · cream · ink",
    tokens: {
      brand: BASE_PALETTE.magenta,
      accent: BASE_PALETTE.acidYellow,
      surface: BASE_PALETTE.cream,
      surfaceAlt: BASE_PALETTE.ink,
      onBrand: BASE_PALETTE.cream,
      onSurface: BASE_PALETTE.ink,
      shadow: BASE_PALETTE.ink,
    },
    // No palette overrides — site looks exactly as before.
  },
  midnight: {
    id: "midnight",
    label: "Midnight",
    description: "Electric · lime · near-ink",
    tokens: {
      brand: "221 83% 53%",
      accent: "142 76% 73%",
      surface: "222 47% 8%",
      surfaceAlt: "222 47% 4%",
      onBrand: "20 6% 90%",
      onSurface: "20 6% 90%",
      shadow: "0 0% 0%",
    },
    palette: {
      // Re-skin: magenta sections become electric-blue, cream surfaces
      // become near-ink, acid-yellow accents become lime.
      magenta: "221 83% 53%",        // electric-blue
      cream: "222 47% 8%",           // near-ink surface
      ink: "20 6% 90%",              // text/border flips to cream
      acidYellow: "142 76% 73%",     // lime
      electricBlue: "221 83% 53%",
      orange: "32 95% 60%",          // softer orange to fit darker palette
      lime: "142 76% 73%",
      hotPink: "221 83% 53%",
      bubblegum: "221 50% 25%",
    },
  },
  sunburn: {
    id: "sunburn",
    label: "Sunburn",
    description: "Orange · acid · cream",
    tokens: {
      brand: "21 90% 53%",
      accent: "84 81% 56%",
      surface: "20 6% 90%",
      surfaceAlt: "222 47% 4%",
      onBrand: "222 47% 4%",
      onSurface: "222 47% 4%",
      shadow: "222 47% 4%",
    },
    palette: {
      // Magenta becomes orange, electric-blue becomes a warm coral so the
      // whole palette reads like a sunset.
      magenta: "21 90% 53%",         // orange
      electricBlue: "10 80% 55%",    // coral
      hotPink: "21 90% 53%",
      bubblegum: "30 95% 85%",
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

export const resolvePalette = (config?: ThemeConfig | null): Required<PaletteOverrides> => {
  const preset = (config?.preset && THEME_PRESETS[config.preset]) || DEFAULT_THEME;
  return { ...BASE_PALETTE, ...(preset.palette ?? {}) } as Required<PaletteOverrides>;
};

export const applyTheme = (config?: ThemeConfig | null) => {
  const tokens = resolveTheme(config);
  const palette = resolvePalette(config);
  const root = document.documentElement;

  // Semantic tokens
  root.style.setProperty("--brand", tokens.brand);
  root.style.setProperty("--accent", tokens.accent);
  root.style.setProperty("--surface", tokens.surface);
  root.style.setProperty("--surface-alt", tokens.surfaceAlt);
  root.style.setProperty("--on-brand", tokens.onBrand);
  root.style.setProperty("--on-surface", tokens.onSurface);
  root.style.setProperty("--shadow", tokens.shadow);

  // Named palette — this is what makes existing bg-magenta / bg-cream / etc.
  // classes across the site re-skin when a preset changes.
  root.style.setProperty("--magenta", palette.magenta);
  root.style.setProperty("--cream", palette.cream);
  root.style.setProperty("--ink", palette.ink);
  root.style.setProperty("--acid-yellow", palette.acidYellow);
  root.style.setProperty("--electric-blue", palette.electricBlue);
  root.style.setProperty("--orange", palette.orange);
  root.style.setProperty("--lime", palette.lime);
  root.style.setProperty("--hot-pink", palette.hotPink);
  root.style.setProperty("--bubblegum", palette.bubblegum);

  // Keep the base background/foreground in sync so the page itself flips too.
  root.style.setProperty("--background", palette.cream);
  root.style.setProperty("--foreground", palette.ink);
  root.style.setProperty("--border", palette.ink);
};
