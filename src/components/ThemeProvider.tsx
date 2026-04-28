import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  applyTheme,
  resolveTheme,
  THEME_PRESETS,
  ThemeConfig,
  DEFAULT_THEME,
} from "@/lib/theme";

type Ctx = {
  config: ThemeConfig;
  setPreset: (preset: string) => void;
  presetIds: string[];
};

const ThemeCtx = createContext<Ctx>({
  config: { preset: "default" },
  setPreset: () => {},
  presetIds: Object.keys(THEME_PRESETS),
});

const LOCAL_KEY = "ccd_theme_preset";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(LOCAL_KEY) : null;
    return { preset: stored && THEME_PRESETS[stored] ? stored : DEFAULT_THEME.id };
  });

  // Apply tokens whenever config changes
  useEffect(() => {
    applyTheme(resolveTheme(config));
  }, [config]);

  // Fetch CMS theme once on mount (only if user has no local override)
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_KEY);
    if (stored) return; // user picked one, respect it
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("theme")
        .eq("id", "main")
        .maybeSingle();
      const t = (data?.theme ?? null) as ThemeConfig | null;
      if (t && t.preset && THEME_PRESETS[t.preset]) {
        setConfig(t);
      }
    })();
  }, []);

  const setPreset = useCallback((preset: string) => {
    if (!THEME_PRESETS[preset]) return;
    setConfig({ preset });
    try { localStorage.setItem(LOCAL_KEY, preset); } catch { /* ignore */ }
  }, []);

  return (
    <ThemeCtx.Provider value={{ config, setPreset, presetIds: Object.keys(THEME_PRESETS) }}>
      {children}
    </ThemeCtx.Provider>
  );
};

export const useTheme = () => useContext(ThemeCtx);
