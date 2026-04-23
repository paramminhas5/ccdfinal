const items = [
  "DANCE MUSIC 🎧",
  "PET CULTURE 🐾",
  "STREETWEAR 👕",
  "EXPERIENCES 🪩",
  "DROPS 💎",
  "COMMUNITY ✨",
];

const Marquee = ({ bg = "bg-acid-yellow", reverse = false }: { bg?: string; reverse?: boolean }) => {
  const loop = [...items, ...items, ...items];
  return (
    <div className={`${bg} border-y-4 border-ink py-4 md:py-8 overflow-hidden`}>
      <div className={`flex gap-10 md:gap-16 whitespace-nowrap marquee marquee-speed ${reverse ? "[animation-direction:reverse]" : ""}`}>
        {loop.map((t, i) => (
          <span key={i} className="font-display text-3xl md:text-7xl text-ink flex items-center gap-10 md:gap-16">
            {t}
            <span className="text-magenta">★</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
