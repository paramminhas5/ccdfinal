const drops = [
  { name: "DISCO PAW TEE", price: "$48", tag: "COMING SOON", color: "bg-acid-yellow" },
  { name: "RAVE COLLAR", price: "$32", tag: "COMING SOON", color: "bg-magenta text-cream" },
  { name: "9 LIVES HOODIE", price: "$96", tag: "DROP 01", color: "bg-electric-blue" },
  { name: "MEOWMIX TOTE", price: "$28", tag: "COMING SOON", color: "bg-lime" },
];

const Drops = () => (
  <section id="drops" className="relative bg-cream border-b-4 border-ink py-24 md:py-32 bg-grain overflow-hidden">
    <div className="container">
      <p className="font-display text-magenta text-2xl md:text-3xl mb-4">/ DROPS · SHOP</p>
      <h2 className="font-display text-ink text-6xl md:text-8xl mb-12 leading-[0.9]">
        WEAR THE<br/>CULTURE.
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {drops.map((d) => (
          <article
            key={d.name}
            className={`${d.color} border-4 border-ink chunk-shadow p-5 hover:-translate-y-1 transition-transform`}
          >
            <div className="aspect-square bg-cream border-4 border-ink mb-4 grid place-items-center font-display text-4xl">
              👕
            </div>
            <span className="inline-block bg-ink text-cream text-xs font-bold px-2 py-1 mb-2">{d.tag}</span>
            <h3 className="font-display text-xl md:text-2xl mb-1">{d.name}</h3>
            <p className="font-display text-lg">{d.price}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default Drops;
