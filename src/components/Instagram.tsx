const HANDLE = "catscandance";

const Instagram = () => (
  <section id="instagram" className="relative bg-magenta border-b-4 border-ink py-24 md:py-32 overflow-hidden">
    <div className="container">
      <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
        <div>
          <p className="font-display text-acid-yellow text-2xl md:text-3xl mb-4">/ INSTAGRAM</p>
          <h2 className="font-display text-cream text-6xl md:text-8xl leading-[0.9] drop-shadow-[5px_5px_0_hsl(var(--ink))]">
            @{HANDLE.toUpperCase()}
          </h2>
        </div>
        <a
          href={`https://instagram.com/${HANDLE}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-acid-yellow text-ink font-display text-lg px-6 py-3 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform"
        >
          FOLLOW US →
        </a>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <a
            key={i}
            href={`https://instagram.com/${HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="aspect-square bg-cream border-4 border-ink chunk-shadow grid place-items-center font-display text-2xl md:text-4xl text-magenta hover:bg-acid-yellow transition-colors"
          >
            🐾
          </a>
        ))}
      </div>
    </div>
  </section>
);

export default Instagram;
