const items = [
  "DANCE MUSIC 🎧",
  "PET CULTURE 🐾",
  "STREETWEAR 👕",
  "EXPERIENCES 🪩",
  "DROPS 💎",
  "COMMUNITY ✨",
];

type Size = "lg" | "sm";

const Marquee = ({
  bg = "bg-acid-yellow",
  reverse = false,
  size = "sm",
}: {
  bg?: string;
  reverse?: boolean;
  size?: Size;
}) => {
  const loop = [...items, ...items, ...items];
  const isLg = size === "lg";
  const padding = isLg ? "py-4 md:py-8" : "py-3 md:py-5";
  const text = isLg ? "text-3xl md:text-7xl" : "text-xl md:text-4xl";
  const gap = isLg ? "gap-10 md:gap-16" : "gap-8 md:gap-12";
  return (
    <div className={`${bg} border-y-4 border-ink ${padding} overflow-hidden`}>
      <div className={`flex ${gap} whitespace-nowrap marquee marquee-speed ${reverse ? "[animation-direction:reverse]" : ""}`}>
        {loop.map((t, i) => (
          <span key={i} className={`font-display ${text} text-ink flex items-center ${gap}`}>
            {t}
            <span className="text-magenta">★</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
