const press = ["MIXMAG", "RESIDENT ADVISOR", "DAZED", "i-D", "HYPEBEAST", "BOILER ROOM"];

const Media = () => (
  <section id="media" className="relative bg-orange border-b-4 border-ink py-24 md:py-32 overflow-hidden">
    <div className="container">
      <p className="font-display text-ink text-2xl md:text-3xl mb-4">/ MEDIA</p>
      <h2 className="font-display text-ink text-6xl md:text-8xl mb-12 leading-[0.9]">
        SEEN<br/>EVERYWHERE.
      </h2>

      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
        {press.map((p) => (
          <li
            key={p}
            className="bg-cream border-4 border-ink chunk-shadow font-display text-ink text-xl md:text-2xl py-6 text-center"
          >
            {p}
          </li>
        ))}
      </ul>

      <div className="grid sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="aspect-video bg-ink border-4 border-ink chunk-shadow grid place-items-center text-cream font-display text-xl"
          >
            ▶ CLIP {i}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Media;
