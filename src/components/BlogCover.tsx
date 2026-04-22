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
  title: string;
  tag: string;
  color?: Color;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const BlogCover = ({ title, tag, color = "cream", className = "", size = "md" }: Props) => {
  const c = palette[color] ?? palette.cream;
  const titleSize =
    size === "lg"
      ? "text-3xl sm:text-5xl md:text-6xl"
      : size === "sm"
      ? "text-xl md:text-2xl"
      : "text-2xl md:text-4xl";

  return (
    <div
      className={`relative w-full h-full ${c.bg} ${c.text} border-4 border-ink overflow-hidden flex flex-col justify-between p-5 md:p-7 ${className}`}
      aria-hidden
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-block ${c.accent} text-[10px] md:text-xs font-bold px-2 py-1 border-2 border-ink uppercase`}>
          {tag}
        </span>
        <span className="font-display text-lg md:text-2xl leading-none opacity-90">★</span>
      </div>

      <h3 className={`font-display ${titleSize} leading-[0.95] break-words`}>
        {title}
      </h3>

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
