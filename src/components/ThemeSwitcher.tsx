import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { THEME_PRESETS } from "@/lib/theme";

const ThemeSwitcher = () => {
  const { config, setPreset, presetIds } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-[60]">
      {open && (
        <div className="mb-2 bg-cream border-4 border-ink chunk-shadow p-2 flex flex-col gap-1 min-w-[180px]">
          {presetIds.map((id) => {
            const p = THEME_PRESETS[id];
            const active = config.preset === id;
            return (
              <button
                key={id}
                onClick={() => { setPreset(id); setOpen(false); }}
                className={`text-left px-3 py-2 font-display text-sm border-2 border-ink flex items-center gap-2 transition-transform hover:translate-x-1 ${active ? "bg-ink text-cream" : "bg-cream text-ink"}`}
              >
                <span
                  aria-hidden
                  className="inline-block w-4 h-4 border-2 border-ink"
                  style={{ background: `hsl(${p.tokens.brand})` }}
                />
                {p.label.toUpperCase()}
              </button>
            );
          })}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch theme"
        title="Switch theme"
        className="w-11 h-11 bg-cream border-4 border-ink chunk-shadow flex items-center justify-center hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform"
      >
        <span
          aria-hidden
          className="block w-5 h-5 rounded-full border-2 border-ink"
          style={{
            background: `conic-gradient(hsl(var(--brand)) 0 33%, hsl(var(--accent)) 33% 66%, hsl(var(--surface-alt)) 66% 100%)`,
          }}
        />
      </button>
    </div>
  );
};

export default ThemeSwitcher;
