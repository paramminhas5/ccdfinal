type Color =
  | "cream"
  | "acid-yellow"
  | "lime"
  | "magenta"
  | "electric-blue"
  | "orange";

const palette: Record<Color, { bg: string; text: string; accent: string }> = {
  cream: { bg: "bg-cream", text: "text-ink", accent: "bg-magenta text-cream" },
  "acid-yellow": { bg: "bg-acid-yellow", text: "text-ink", accent: "bg-ink text-cream" },
  lime: { bg: "bg-lime", text: "text-ink", accent: "bg-magenta text-cream" },
  magenta: { bg: "bg-magenta", text: "text-cream", accent: "bg-acid-yellow text-ink" },
  "electric-blue": { bg: "bg-electric-blue", text: "text-cream", accent: "bg-acid-yellow text-ink" },
  orange: { bg: "bg-orange", text: "text-ink", accent: "bg-ink text-cream" },
};

type Props = {
  /** Original title — used only for accessibility, not rendered */
  title: string;
  tag: string;
  /** Short 2-3 word kicker shown big on the cover. Falls back to tag. */
  kicker?: string;
  /** Issue number; renders as "№ 01". */
  issue?: number;
  color?: Color;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const BlogCover = ({ title, tag, kicker, issue, color = "cream", className = "", size = "md" }: Props) => {
  const c = palette[color] ?? palette.cream;
  const issueLabel = typeof issue === "number" ? `№ ${String(issue).padStart(2, "0")}` : null;
  const kickerText = (kicker || tag).toUpperCase();

  const issueSize =
    size === "lg"
      ? "text-5xl sm:text-7xl md:text-8xl"
      : size === "sm"
      ? "text-3xl md:text-4xl"
      : "text-4xl md:text-6xl";

  const kickerSize =
    size === "lg"
      ? "text-2xl sm:text-4xl md:text-5xl"
      : size === "sm"
      ? "text-base md:text-lg"
      : "text-xl md:text-3xl";

  return (
    <div
      role="img"
      aria-label={title}
      className={`relative w-full h-full ${c.bg} ${c.text} border-4 border-ink overflow-hidden flex flex-col justify-between p-5 md:p-7 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-block ${c.accent} text-[10px] md:text-xs font-bold px-2 py-1 border-2 border-ink uppercase`}>
          {tag}
        </span>
        <span className="font-display text-lg md:text-2xl leading-none opacity-90">★</span>
      </div>

      <div className="flex flex-col gap-1">
        {issueLabel && (
          <p className={`font-display ${issueSize} leading-[0.9] tracking-tight`}>{issueLabel}</p>
        )}
        <p className={`font-display ${kickerSize} leading-[0.95] tracking-tight opacity-90`}>
          {kickerText}
        </p>
      </div>

      <div className="flex items-end justify-between gap-3">
        <span className="font-display text-[10px] md:text-xs tracking-widest opacity-80">
          CATS · CAN · DANCE
        </span>
        <span className="font-display text-base md:text-xl opacity-80">🐾</span>
      </div>
    </div>
  );
};

export default BlogCover;
