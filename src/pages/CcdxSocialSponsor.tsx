import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import "./ccd.css";
import Marquee from "@/components/Marquee";
import SEO from "@/components/SEO";

const HERO_CHIPS = [
  "200 pax per show",
  "2,000+ at finale",
  "Outdoor pet zone",
  "Startdawg · Merman + more",
  "Jun–Oct 2026",
];

const STATS = [
  { label: "Per show capacity", value: "~200 pax", bg: "bg-lime", fg: "text-ink" },
  { label: "Grand finale", value: "2,000+ pax", bg: "bg-magenta", fg: "text-cream" },
  { label: "Series total reach", value: "3,000+ across 4 events", bg: "bg-electric-blue", fg: "text-cream" },
  { label: "Audience profile", value: "Urban 24–45, pet parents + electronic music fans", bg: "bg-acid-yellow", fg: "text-ink" },
  { label: "Content output", value: "Photo + video from every show, shared with sponsors", bg: "bg-cream", fg: "text-ink" },
];

const SHOWS = [
  { tag: "SHOW 01", title: "CCDXSOCIAL 01", sub: "BROAD · WELCOMING · FIRST IMPRESSION", date: "Sun, 29 Jun 2026", meta: "~200 pax · 4PM–close", bg: "bg-lime", fg: "text-ink" },
  { tag: "SHOW 02", title: "CCDXSOCIAL 02", sub: "STYLE · FASHION · MIDSUMMER ENERGY", date: "Sun, 27 Jul 2026", meta: "~200 pax · 4PM–close", bg: "bg-acid-yellow", fg: "text-ink" },
  { tag: "SHOW 03", title: "CCDXSOCIAL 03", sub: "AGILITY · FINALE PREVIEW · ONE MORE", date: "Sun, 30 Aug 2026", meta: "~200 pax · 4PM–close", bg: "bg-magenta", fg: "text-cream" },
];

const TIERS = [
  {
    badge: "🐾",
    eyebrow: "All 3 shows + Grand Finale",
    title: "SERIES PARTNER",
    tagline: "Be the name everyone remembers",
    bullets: [
      "Headline logo on all event materials — posters, socials, stage",
      "Dedicated activation booth at all 3 shows + finale",
      "Stage naming rights at grand format show",
      "Co-branded content package (photo + video) from every show",
      "3 dedicated social posts + stories across CCD channels",
      "Brand mention in every RSVP confirmation email",
      "Logo on CCD website for the full season",
      "Option to co-brand the pet zone",
      "2 VIP + early access passes per show",
    ],
    bestFit: "pet brands, lifestyle brands, beverages, outdoor brands wanting max reach",
    bg: "bg-lime",
    fg: "text-ink",
  },
  {
    badge: "✦",
    eyebrow: "One show of your choice",
    title: "SHOW SPONSOR",
    tagline: "Own a single night end to end",
    bullets: [
      "Headline logo at your chosen show",
      "Dedicated activation booth",
      "Co-branded content package from that show",
      "1 dedicated social post + stories",
      "Brand mention in that show's RSVP emails",
      "Logo on event page for the duration",
      "2 passes to the show",
    ],
    bestFit: "local brands, product launches, grooming & nutrition brands",
    bg: "bg-cream",
    fg: "text-ink",
  },
  {
    badge: "🌿",
    eyebrow: "All shows, light touch",
    title: "COMMUNITY SUPPORTER",
    tagline: "Show up everywhere, simply",
    bullets: [
      "Logo across all event materials (below fold)",
      "Social tag in one round-up post per show",
      "Mention in event comms and on the website",
      "2 passes split across the season",
    ],
    bestFit: "indie pet brands, local businesses, NGOs, community partners",
    bg: "bg-acid-yellow",
    fg: "text-ink",
  },
];

const SPONSOR_CATEGORIES = [
  { emoji: "🐾", label: "Pet food & nutrition brands" },
  { emoji: "✂️", label: "Grooming & wellness brands" },
  { emoji: "👗", label: "Pet accessories & fashion" },
  { emoji: "🎧", label: "Audio & lifestyle brands" },
  { emoji: "🍺", label: "Beverages & F&B brands" },
  { emoji: "📸", label: "Photo & creative services" },
  { emoji: "🏕️", label: "Outdoor & adventure brands" },
  { emoji: "💊", label: "Pet health & supplements" },
];

const PERKS = [
  { emoji: "🎪", title: "On-site activation space", body: "Your own area in the outdoor pet zone or event floor" },
  { emoji: "📸", title: "Content assets", body: "Professional photo + video from every show you sponsor, yours to use" },
  { emoji: "📣", title: "Social reach", body: "CCD Instagram, email newsletter, event pages — targeted pet + music fans" },
  { emoji: "🤝", title: "Co-branding", body: "Your brand alongside CCD on all materials for your shows" },
  { emoji: "🎟️", title: "Guest access", body: "Passes for your team to attend and experience the events" },
  { emoji: "📊", title: "Post-event report", body: "Attendance, content delivery, social stats — sent within a week of each show" },
];

const SPONSOR_MAILTO = "mailto:hello@catscandance.com?subject=CCDxSocial%20Sponsorship";

const CcdxSocialSponsor = () => {
  useEffect(() => {
    document.documentElement.classList.add("ccd-standalone");
    return () => {
      document.documentElement.classList.remove("ccd-standalone");
    };
  }, []);

  return (
    <main className="bg-electric-blue text-cream min-h-screen">
      <SEO
        title="Sponsor CCDxSocial — Cats Can Dance"
        description="Sponsor the CCDxSocial series — 3 shows + 1 grand finale, Jun–Oct 2026. Animal lovers and electronic music fans, together in Bangalore."
        path="/ccdxsocial/sponsor"
        noindex
      />
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* HERO */}
      <section className="relative bg-electric-blue border-b-4 border-ink py-10 md:py-16 lg:py-20 overflow-hidden">
        {/* Decorative paw-print easter eggs */}
        <span aria-hidden className="absolute top-6 right-8 text-4xl opacity-30 -rotate-12 select-none">🐾</span>
        <span aria-hidden className="absolute bottom-8 left-6 text-3xl opacity-25 rotate-12 select-none">🐾</span>
        <span aria-hidden className="absolute top-1/2 right-1/4 text-2xl opacity-20 rotate-45 select-none">★</span>

        <div className="container relative">
          <div className="inline-block bg-acid-yellow text-ink border-4 border-ink chunk-shadow px-3 py-1 mb-5 font-display text-xs sm:text-sm -rotate-1">
            / SPONSOR THE SERIES ★ 2026 EDITION
          </div>
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-10 items-start">
            <div>
              <h1 className="font-display text-cream leading-[0.9] text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-3 chunk-shadow-text">
                BE PART OF<br />SOMETHING<br />DIFFERENT.
              </h1>
              <p className="text-cream/90 text-sm sm:text-base md:text-lg font-medium max-w-xl">
                3 shows + 1 grand format show. End of June 2026. Animal lovers and electronic music fans — together.
                Own a show, own the series, or show up everywhere.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 bg-lime text-ink border-4 border-ink chunk-shadow px-3 py-1.5 font-display text-xs sm:text-sm rotate-1">
                🐾 PET-FRIENDLY · 🎧 LIVE SETS · ★ LIMITED SLOTS
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {HERO_CHIPS.map((c, i) => (
                <span
                  key={c}
                  className={`inline-block bg-electric-blue text-cream border-4 border-cream px-3 py-1.5 font-display text-xs sm:text-sm ${
                    i % 2 === 0 ? "-rotate-1" : "rotate-1"
                  }`}
                >
                  ★ {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Marquee
        bg="bg-lime"
        items={[
          "CCDXSOCIAL 01",
          "CCDXSOCIAL 02",
          "CCDXSOCIAL 03",
          "MEGA",
          "JUN–OCT 2026",
          "SPONSOR A SHOW",
          "SPONSOR THE SERIES",
          "ANIMAL LOVERS + DANCE MUSIC",
        ]}
      />

      {/* OPPORTUNITY */}
      <section className="bg-cream text-ink border-b-4 border-ink py-12 md:py-16 lg:py-20 bg-grain">
        <div className="container grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <p className="font-display text-magenta text-base sm:text-lg mb-3 tracking-wide">/ THE OPPORTUNITY</p>
            <h2 className="font-display leading-[0.95] text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-5">
              A CROWD THAT<br />ACTUALLY CARES.
            </h2>
            <p className="text-ink/80 text-sm sm:text-base md:text-lg font-medium mb-3">
              The CCDxSocial series brings together two of the most passionate communities in Bangalore:
              animal lovers and electronic music fans. These aren't passive attendees — they're here for
              something specific, and they spend money on the things they love.
            </p>
            <p className="text-ink/80 text-sm sm:text-base md:text-lg font-medium">
              Outdoor pet zone from 4PM with activities, vendor market, and a full DJ lineup. Approximately
              200 people per show, 2,000+ at the grand finale. Your brand is not a banner — it's part of
              the experience.
            </p>
          </div>
          <ul className="space-y-3 self-center w-full">
            {STATS.map((s, i) => (
              <li
                key={s.label}
                className={`${s.bg} ${s.fg} border-4 border-ink chunk-shadow p-4 flex items-center justify-between gap-4 hover:-translate-y-1 hover:translate-x-1 transition-transform ${
                  i % 2 === 0 ? "-rotate-[0.5deg]" : "rotate-[0.5deg]"
                }`}
              >
                <span className="font-display uppercase text-xs sm:text-sm tracking-wide">{s.label}</span>
                <span className="font-display text-sm sm:text-base md:text-lg text-right">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Marquee
        bg="bg-acid-yellow"
        items={["★ WOOF", "★ BARK", "★ BASS", "★ REPEAT", "★ TAILS UP", "★ HANDS UP"]}
      />

      {/* SERIES */}
      <section className="bg-electric-blue text-cream border-b-4 border-ink py-12 md:py-16 lg:py-20">
        <div className="container">
          <p className="font-display text-lime text-base sm:text-lg mb-3 tracking-wide">/ THE SERIES</p>
          <h2 className="font-display leading-[0.95] text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-8">
            THREE SHOWS.<br />ONE GRAND FINALE.
          </h2>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {SHOWS.map((s, i) => (
              <div
                key={s.title}
                className={`${s.bg} ${s.fg} border-4 border-ink chunk-shadow p-5 hover:-translate-y-1 hover:translate-x-1 transition-transform relative`}
              >
                <span aria-hidden className={`absolute -top-3 -right-3 bg-ink text-cream border-4 border-ink px-2 py-0.5 font-display text-xs ${i % 2 ? "-rotate-6" : "rotate-6"}`}>
                  0{i + 1}
                </span>
                <p className="font-display text-xs sm:text-sm mb-2 opacity-70">{s.tag}</p>
                <h3 className="font-display text-xl sm:text-2xl mb-2 leading-tight">{s.title}</h3>
                <p className="font-display text-xs mb-3 opacity-80">{s.sub}</p>
                <p className="font-medium text-sm sm:text-base">{s.date}</p>
                <p className="text-xs opacity-80 mt-1">{s.meta}</p>
              </div>
            ))}
          </div>
          <div className="bg-magenta text-cream border-4 border-ink chunk-shadow-lg p-5 sm:p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-5 items-center relative">
            <span aria-hidden className="absolute -top-4 left-6 bg-acid-yellow text-ink border-4 border-ink px-3 py-1 font-display text-xs -rotate-2">★ THE FINALE</span>
            <div>
              <p className="font-display text-xs sm:text-sm mb-2 opacity-80">SEASON FINALE · DATE TBA</p>
              <h3 className="font-display text-2xl sm:text-3xl md:text-4xl mb-3 leading-tight">
                MEGA — GRAND FORMAT SHOW
              </h3>
              <p className="text-cream/90 text-sm sm:text-base max-w-2xl">
                Full outdoor stage. 2,000+ people. Pet runway. Agility finals. Complete DJ lineup TBA.
                The biggest thing we've ever done — and the best chance for a sponsor to make a mark.
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="font-display text-4xl sm:text-5xl md:text-6xl leading-none">2,000+</p>
              <p className="font-display text-xs mt-1 opacity-80">pax expected</p>
            </div>
          </div>
        </div>
      </section>

      {/* TIERS */}
      <section className="bg-cream text-ink border-b-4 border-ink py-12 md:py-16 lg:py-20 bg-grain">
        <div className="container">
          <p className="font-display text-magenta text-base sm:text-lg mb-3 tracking-wide">/ SPONSOR TIERS</p>
          <h2 className="font-display leading-[0.95] text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4">
            SUPPORT A SHOW.<br />OR THE WHOLE THING.
          </h2>
          <p className="text-ink/80 text-sm sm:text-base md:text-lg font-medium mb-8 max-w-3xl">
            Pick a single show or back the whole series. Every tier includes real presence — not a logo
            in a corner. We build the activation with you.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {TIERS.map((t, i) => (
              <article
                key={t.title}
                className={`${t.bg} ${t.fg} border-4 border-ink chunk-shadow p-5 flex flex-col relative hover:-translate-y-1 hover:translate-x-1 transition-transform`}
              >
                {i === 0 && (
                  <span aria-hidden className="absolute -top-3 -right-3 bg-magenta text-cream border-4 border-ink px-2 py-0.5 font-display text-xs rotate-6">
                    ★ MOST WANTED
                  </span>
                )}
                <div className="text-3xl mb-2">{t.badge}</div>
                <p className="font-display text-xs mb-1 opacity-80 uppercase">{t.eyebrow}</p>
                <h3 className="font-display text-xl sm:text-2xl mb-1 leading-tight">{t.title}</h3>
                <p className="font-medium text-sm mb-4 opacity-90">{t.tagline}</p>
                <ul className="space-y-1.5 mb-4 flex-1">
                  {t.bullets.map((b) => (
                    <li key={b} className="flex gap-2 text-xs sm:text-sm">
                      <span aria-hidden>★</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs opacity-80 mb-4">
                  <span className="font-display uppercase">Best fit for:</span> {t.bestFit}
                </p>
                <a
                  href={SPONSOR_MAILTO}
                  className="inline-block text-center bg-ink text-cream font-display text-sm sm:text-base px-4 py-2.5 border-4 border-ink hover:translate-x-1 hover:translate-y-1 transition-transform"
                >
                  ENQUIRE NOW →
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHO SHOULD SPONSOR */}
      <section className="bg-acid-yellow text-ink border-b-4 border-ink py-12 md:py-16 lg:py-20 relative overflow-hidden">
        <span aria-hidden className="absolute top-4 right-6 text-5xl opacity-20 rotate-12 select-none">🐾</span>
        <div className="container relative">
          <p className="font-display text-magenta text-base sm:text-lg mb-3 tracking-wide">/ WHO SHOULD SPONSOR</p>
          <h2 className="font-display leading-[0.95] text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-8">
            YOUR BRAND BELONGS HERE<br />IF YOU CARE ABOUT THIS.
          </h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SPONSOR_CATEGORIES.map((c, i) => (
              <li
                key={c.label}
                className={`bg-cream text-ink border-4 border-ink chunk-shadow p-4 font-display text-sm sm:text-base flex items-center gap-3 hover:-translate-y-1 hover:translate-x-1 transition-transform ${
                  i % 2 === 0 ? "-rotate-[0.75deg]" : "rotate-[0.75deg]"
                }`}
              >
                <span className="text-2xl shrink-0" aria-hidden>{c.emoji}</span>
                <span>{c.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Marquee
        bg="bg-magenta"
        items={[
          "STAGE PRESENCE",
          "CO-BRANDED CONTENT",
          "EMAIL REACH",
          "SOCIAL POSTS",
          "ON-SITE ACTIVATION",
          "BRANDED EXPERIENCE",
        ]}
      />

      {/* WHAT YOU GET */}
      <section className="bg-cream text-ink border-b-4 border-ink py-12 md:py-16 lg:py-20 bg-grain">
        <div className="container">
          <p className="font-display text-magenta text-base sm:text-lg mb-3 tracking-wide">/ WHAT YOU GET</p>
          <h2 className="font-display leading-[0.95] text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4">
            MORE THAN A LOGO.
          </h2>
          <p className="text-ink/80 text-sm sm:text-base md:text-lg font-medium mb-8 max-w-3xl">
            Every sponsor at CCDxSocial is integrated into the experience — not pasted on top of it.
            We build the activation with you so it actually makes sense in the room.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PERKS.map((p) => (
              <div
                key={p.title}
                className="bg-electric-blue text-cream border-4 border-ink chunk-shadow p-5 hover:-translate-y-1 hover:translate-x-1 transition-transform"
              >
                <div className="text-3xl mb-2" aria-hidden>{p.emoji}</div>
                <h3 className="font-display text-lg sm:text-xl mb-1">{p.title}</h3>
                <p className="text-cream/85 text-sm">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-lime text-ink border-b-4 border-ink py-12 md:py-16 lg:py-20 relative overflow-hidden">
        <span aria-hidden className="absolute -top-4 -right-4 text-7xl opacity-20 rotate-12 select-none">★</span>
        <div className="container max-w-4xl relative">
          <p className="font-display text-magenta text-base sm:text-lg mb-3 tracking-wide">/ LET'S TALK</p>
          <h2 className="font-display leading-[0.95] text-4xl sm:text-5xl md:text-6xl mb-5">
            READY TO<br />SPONSOR?
          </h2>
          <p className="text-ink/80 text-base sm:text-lg md:text-xl font-medium mb-8 max-w-2xl">
            Fill in the form and we'll get back to you within 24 hours with the full sponsorship pack.
            All tiers are negotiable — we'd rather build something that works for both sides.
          </p>
          <div className="flex flex-wrap gap-4 mb-8">
            <a
              href={SPONSOR_MAILTO}
              className="inline-block bg-magenta text-cream font-display text-lg sm:text-xl px-6 py-3 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform"
            >
              GET THE SPONSOR PACK →
            </a>
            <a
              href={SPONSOR_MAILTO}
              className="inline-block bg-cream text-ink font-display text-lg sm:text-xl px-6 py-3 border-4 border-ink chunk-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform"
            >
              EMAIL US DIRECTLY
            </a>
          </div>
          <p className="text-ink/70 text-sm sm:text-base mb-12">
            hello@catscandance.com · @catscan.dance
          </p>
          <div className="border-t-4 border-ink pt-8">
            <p className="font-display uppercase text-sm mb-4 opacity-80">Want to see the full partnership proposal?</p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/ccdxsocial"
                className="inline-block bg-ink text-cream font-display text-base sm:text-lg px-5 py-3 border-4 border-ink hover:translate-x-1 hover:translate-y-1 transition-transform"
              >
                VIEW PROPOSAL →
              </a>
              <a
                href="/events"
                className="inline-block bg-cream text-ink font-display text-base sm:text-lg px-5 py-3 border-4 border-ink hover:translate-x-1 hover:translate-y-1 transition-transform"
              >
                SEE ALL EVENTS →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <footer className="bg-ink text-cream py-10">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-display text-base sm:text-lg">CATS · CAN · DANCE × SOCIAL</p>
          <p className="text-cream/70 text-sm">Bangalore · hello@catscandance.com</p>
        </div>
      </footer>
    </main>
  );
};

export default CcdxSocialSponsor;
