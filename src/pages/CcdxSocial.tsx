/**
 * CCD × SOCIAL — Public-facing series landing page (/ccdxsocial).
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import SEO from "@/components/SEO";
import catDjHero from "@/assets/cat-dj-hero.png";

// ── Countdown ─────────────────────────────────────────────────────────────────
const NEXT_SHOW_DATE = new Date("2026-06-29T14:30:00Z"); // 8 PM IST

function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, over: true };
    const s = Math.floor(diff / 1000);
    return {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      mins: Math.floor((s % 3600) / 60),
      secs: s % 60,
      over: false,
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

const Pad = (n: number) => String(n).padStart(2, "0");

// ── Show data ─────────────────────────────────────────────────────────────────
const SHOWS = [
  {
    step: 1,
    num: "01",
    slug: "ccdxsocial-01",
    name: "CCDXSOCIAL 01",
    date: "Sun, 29 Jun 2026",
    venue: "Indiranagar Social, BLR",
    tagline: "Broad · Welcoming · First Impression",
    desc: "The first chapter. Portrait booth, lookalike contest, vendor market in the afternoon. Startdawg b2b Merman take the floor at 9. The pack meets for the first time.",
    activities: ["🎨 Pet Portrait Booth", "👯 Lookalike Contest", "🛍️ Vendor Market", "🎧 Startdawg b2b Merman"],
    bg: "bg-electric-blue",
    text: "text-cream",
    accent: "text-acid-yellow",
    isNext: true,
    isMega: false,
  },
  {
    step: 2,
    num: "02",
    slug: "ccdxsocial-02",
    name: "CCDXSOCIAL 02",
    date: "Sun, 27 Jul 2026",
    venue: "Social BLR (TBC)",
    tagline: "Style · Fashion · Midsummer Energy",
    desc: "The style chapter. Midsummer, outdoors, everyone at their best. Live grooming demo, best-dressed contest, dedicated photography corner.",
    activities: ["✂️ Live Grooming Demo", "👗 Best-Dressed Contest", "📸 Style Photo Corner", "🎧 Startdawg b2b Merman"],
    bg: "bg-magenta",
    text: "text-cream",
    accent: "text-acid-yellow",
    isNext: false,
    isMega: false,
  },
  {
    step: 3,
    num: "03",
    slug: "ccdxsocial-03",
    name: "CCDXSOCIAL 03",
    date: "Sun, 30 Aug 2026",
    venue: "Social BLR (TBC)",
    tagline: "Agility · Performance · Pre-Finale",
    desc: "The most physical show. Two agility courses, timed speed runs, performance contest. MEGA tickets drop exclusively at this event.",
    activities: ["🏃 Two Agility Courses", "⚡ Timed Speed Run", "🎟️ MEGA Ticket Drop", "🎧 Startdawg b2b Merman"],
    bg: "bg-ink",
    text: "text-cream",
    accent: "text-acid-yellow",
    isNext: false,
    isMega: false,
  },
  {
    step: 4,
    num: "★",
    slug: "ccdxsocial-mega",
    name: "MEGA",
    date: "October 2026",
    venue: "TBA — Large Format",
    tagline: "Grand Finale · Season Closer",
    desc: "Everything the series has been building to. Full outdoor stage. 2,000+ people. Pet runway. Agility finals. The whole pack in one place.",
    activities: ["🎪 Full Outdoor Stage", "🐾 Pet Runway", "🏆 Agility Finals", "🎧 Full Lineup TBA"],
    bg: "bg-acid-yellow",
    text: "text-ink",
    accent: "text-magenta",
    isNext: false,
    isMega: true,
  },
];

const PILLARS = [
  {
    icon: "🐾",
    title: "THE PET ZONE",
    body: "Outdoor pet zone runs all afternoon from 4 PM — agility courses, portrait booths, vendor market, and activities that change every show.",
    bg: "bg-electric-blue",
    text: "text-cream",
  },
  {
    icon: "🎧",
    title: "THE FLOOR",
    body: "Doors open at 8 PM. Music kicks in at 9. Startdawg b2b Merman hold it down every show, with a special guest on the late slot.",
    bg: "bg-magenta",
    text: "text-cream",
  },
  {
    icon: "🛍️",
    title: "THE MARKET",
    body: "2–3 curated brands per show. Pet-first vendors: nutrition, accessories, grooming, photography. No randomness — every brand is chosen.",
    bg: "bg-acid-yellow",
    text: "text-ink",
  },
];

const STATS = [
  { val: "3", label: "Mini shows" },
  { val: "1", label: "Grand finale" },
  { val: "~200", label: "Pax per show" },
  { val: "2,000+", label: "At MEGA" },
  { val: "Free", label: "Entry — RSVP only" },
  { val: "🐾", label: "Pets welcome" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EventSeries",
  name: "CCD × SOCIAL",
  description:
    "India's first curated pet lifestyle festival series — underground dance music + outdoor pet zone. 3 shows + grand finale at Social BLR, Jun–Oct 2026.",
  url: "https://catscandance.com/ccdxsocial",
  organizer: {
    "@type": "Organization",
    name: "Cats Can Dance",
    url: "https://catscandance.com",
  },
  location: {
    "@type": "Place",
    name: "Social, Bengaluru",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
  },
};

export default function CcdxSocial() {
  const cd = useCountdown(NEXT_SHOW_DATE);

  return (
    <>
      <SEO
        title="CCD × SOCIAL — India's First Pet Lifestyle Festival Series"
        description="3 shows + a grand finale at Social BLR, Jun–Oct 2026. Outdoor pet zone in the afternoon. Underground dance music after dark. Free entry, RSVP only."
        path="/ccdxsocial"
        jsonLd={jsonLd}
      />
      <Nav />

      <main className="bg-cream text-ink">
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="bg-ink text-cream pt-28 md:pt-32 pb-16 md:pb-24 border-b-4 border-ink overflow-hidden">
          <div className="container">
            <div className="grid lg:grid-cols-[1.3fr_1fr] gap-10 lg:gap-14 items-center">
              {/* Left */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="font-display text-xs px-3 py-1 bg-magenta text-cream border-4 border-cream chunk-shadow">Series</span>
                  <span className="font-display text-xs px-3 py-1 bg-acid-yellow text-ink border-4 border-cream chunk-shadow">Jun – Oct 2026</span>
                  <span className="font-display text-xs px-3 py-1 bg-electric-blue text-cream border-4 border-cream chunk-shadow">Bengaluru</span>
                </div>

                <h1 className="font-display leading-[0.85] tracking-tight text-6xl sm:text-7xl md:text-8xl lg:text-9xl">
                  <span className="block">CATS</span>
                  <span className="block">CAN</span>
                  <span className="block text-acid-yellow">DANCE</span>
                  <span className="block text-magenta">× SOCIAL</span>
                </h1>

                <p className="mt-8 max-w-xl text-lg md:text-xl text-cream/85 leading-relaxed">
                  India's first curated pet lifestyle festival. Outdoor pet zone in the afternoon.
                  Underground dance music after dark. Three shows. One grand finale.
                </p>

                {/* Countdown */}
                {!cd.over ? (
                  <div className="mt-8 inline-block bg-cream text-ink border-4 border-cream chunk-shadow p-5">
                    <div className="font-display text-xs text-magenta mb-3">▶ CCDXSOCIAL 01 IN</div>
                    <div className="flex gap-3">
                      {[
                        { val: cd.days, label: "DAYS" },
                        { val: cd.hours, label: "HRS" },
                        { val: cd.mins, label: "MIN" },
                        { val: cd.secs, label: "SEC" },
                      ].map(({ val, label }) => (
                        <div key={label} className="text-center">
                          <div className="font-display text-3xl md:text-4xl leading-none">{Pad(val)}</div>
                          <div className="font-display text-[10px] mt-1 text-ink/60">{label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="font-display text-[11px] mt-3 text-ink/70">SUN 29 JUN · INDIRANAGAR SOCIAL</div>
                  </div>
                ) : (
                  <div className="mt-8">
                    <p className="font-display text-sm text-magenta">/ NEXT SHOW</p>
                    <p className="font-display text-3xl mt-2">CCDXSOCIAL 01</p>
                    <p className="text-cream/80 mt-1">Sun, 29 Jun 2026 · Indiranagar Social</p>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/events"
                    className="inline-block bg-acid-yellow text-ink font-display text-lg px-7 py-4 border-4 border-cream chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
                  >
                    RSVP NOW →
                  </Link>
                  <Link
                    to="/ccdxsocial/sponsor"
                    className="inline-block bg-magenta text-cream font-display text-lg px-7 py-4 border-4 border-cream chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
                  >
                    SPONSOR THE SERIES ✦
                  </Link>
                </div>
              </div>

              {/* Right — hero DJ cat */}
              <div className="relative">
                <div className="bg-electric-blue border-4 border-cream chunk-shadow-lg p-4 rotate-[-2deg]">
                  <img
                    src={catDjHero}
                    alt="DJ cat — CCD × SOCIAL"
                    className="w-full h-auto block"
                    loading="eager"
                  />
                </div>
                <div className="absolute -bottom-5 -right-3 bg-acid-yellow text-ink font-display text-xs px-3 py-2 border-4 border-ink chunk-shadow rotate-[4deg]">
                  PETS WELCOME 🐾
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <Marquee
          bg="bg-acid-yellow"
          size="lg"
          items={["CCD × SOCIAL", "PET ZONE 🐾", "DANCE FLOOR 🎧", "JUN–OCT 2026", "BENGALURU", "FREE ENTRY"]}
        />

        {/* ── CONCEPT ── */}
        <section className="bg-cream py-20 md:py-28 border-b-4 border-ink">
          <div className="container grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <p className="font-display text-sm text-magenta">/ THE IDEA</p>
              <h2 className="font-display text-5xl md:text-7xl leading-[0.9] mt-3">
                TWO COMMUNITIES.<br />ONE ROOM.
              </h2>
              <p className="text-lg md:text-xl mt-6 max-w-xl">
                CCD × SOCIAL brings together two of the most passionate crowds in Bangalore —
                pet parents and underground music fans — and gives them an afternoon and an evening
                worth leaving the house for.
              </p>
              <p className="text-base md:text-lg mt-4 text-ink/70 max-w-xl">
                Pet zone opens at 4 PM. Floor opens at 8 PM.
                It's not a gimmick — it's a different kind of Sunday.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {STATS.map((s) => (
                <div key={s.label} className="bg-ink text-cream border-4 border-ink chunk-shadow p-5">
                  <p className="font-display text-3xl md:text-4xl text-acid-yellow">{s.val}</p>
                  <p className="font-display text-xs mt-2 text-cream/80">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SERIES TIMELINE ── */}
        <section className="bg-electric-blue text-cream py-20 md:py-28 border-b-4 border-ink">
          <div className="container">
            <p className="font-display text-sm text-acid-yellow">/ THE SEASON</p>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9] mt-3">THE JOURNEY.</h2>
            <p className="text-lg md:text-xl mt-4 max-w-2xl text-cream/85">
              Four events. One arc. Each show builds on the last — and MEGA closes it all out.
            </p>

            {/* Step progress bar (desktop) */}
            <div className="hidden md:flex items-center mt-12 mb-10">
              {SHOWS.map((show, i) => (
                <div key={show.slug} className="flex items-center flex-1 last:flex-none">
                  <div
                    className={`w-12 h-12 grid place-items-center border-4 border-cream chunk-shadow font-display text-lg ${
                      show.isNext ? "bg-acid-yellow text-ink" : show.isMega ? "bg-magenta text-cream" : "bg-ink text-cream"
                    }`}
                  >
                    {show.isMega ? "★" : show.step}
                  </div>
                  {i < SHOWS.length - 1 && <div className="flex-1 h-1 bg-cream/40 mx-2" />}
                </div>
              ))}
            </div>

            {/* Show cards */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {SHOWS.map((show) => (
                <article
                  key={show.slug}
                  className={`relative ${show.bg} ${show.text} border-4 border-cream chunk-shadow p-6 md:p-8`}
                >
                  {show.isNext && (
                    <span className="absolute -top-4 left-4 bg-acid-yellow text-ink font-display text-xs px-3 py-1 border-4 border-ink chunk-shadow">
                      ▶ YOU ARE HERE · NEXT UP
                    </span>
                  )}
                  {show.isMega && (
                    <span className="absolute -top-4 left-4 bg-magenta text-cream font-display text-xs px-3 py-1 border-4 border-ink chunk-shadow">
                      ★ GRAND FINALE
                    </span>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display text-xs opacity-80">
                      {show.isMega ? "SEASON FINALE" : `SHOW ${show.num}`}
                    </span>
                    <span className="font-display text-xs opacity-80">
                      {show.isMega ? "2,000+" : "~200"} pax
                    </span>
                  </div>

                  <h3 className="font-display text-3xl md:text-4xl leading-tight">{show.name}</h3>
                  <p className={`font-display text-sm mt-2 ${show.accent}`}>{show.tagline}</p>
                  <p className="mt-4 text-base opacity-90">{show.desc}</p>

                  <ul className="mt-5 grid grid-cols-2 gap-2">
                    {show.activities.map((a) => (
                      <li key={a} className="font-display text-xs opacity-90">
                        {a}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex items-end justify-between gap-3">
                    <div>
                      <p className="font-display text-sm">{show.date}</p>
                      <p className="text-xs opacity-80">{show.venue}</p>
                    </div>
                    <Link
                      to="/events"
                      className="inline-block bg-cream text-ink font-display text-xs px-4 py-2 border-4 border-ink chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
                    >
                      {show.isNext ? "RSVP FREE →" : show.isMega ? "SEE DETAILS →" : "MORE INFO →"}
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Season progress footer */}
            <div className="mt-12 bg-ink border-4 border-cream chunk-shadow p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="font-display text-sm text-acid-yellow">Season 1 — Jun to Oct 2026</p>
                <p className="mt-1 text-cream/85">
                  Show 1 of 4 coming up.{" "}
                  <span className="text-acid-yellow font-display">
                    {!cd.over ? `${cd.days} days away.` : "Happening now."}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/events"
                  className="inline-block bg-acid-yellow text-ink font-display text-sm px-5 py-3 border-4 border-cream chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
                >
                  RSVP FOR SHOW 01 →
                </Link>
                <Link
                  to="/ccdxsocial/sponsor"
                  className="inline-block bg-magenta text-cream font-display text-sm px-5 py-3 border-4 border-cream chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
                >
                  SPONSOR THE SERIES ✦
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT TO EXPECT ── */}
        <section className="bg-cream py-20 md:py-28 border-b-4 border-ink">
          <div className="container">
            <p className="font-display text-sm text-magenta">/ WHAT YOU GET</p>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9] mt-3">
              EVERY SHOW.<br />SAME FORMULA.
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {PILLARS.map((p) => (
                <div key={p.title} className={`${p.bg} ${p.text} border-4 border-ink chunk-shadow p-6 md:p-8`}>
                  <div className="text-5xl">{p.icon}</div>
                  <h3 className="font-display text-2xl mt-4">{p.title}</h3>
                  <p className="mt-3 text-base opacity-90">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SPONSOR CTA ── */}
        <section className="bg-ink text-cream py-20 md:py-28 border-b-4 border-ink">
          <div className="container grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="font-display text-sm text-acid-yellow">/ FOR BRANDS</p>
              <h2 className="font-display text-5xl md:text-7xl leading-[0.9] mt-3">
                SPONSOR<br />THE SERIES.
              </h2>
              <p className="mt-6 text-lg max-w-xl text-cream/85">
                3 shows + MEGA. Urban 24–45 crowd, deeply passionate about their
                pets and their music. Your brand is not a banner — it's part of the room.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/ccdxsocial/sponsor"
                  className="inline-block bg-acid-yellow text-ink font-display text-lg px-7 py-4 border-4 border-cream chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
                >
                  SEE SPONSOR TIERS →
                </Link>
                <a
                  href="mailto:hello@catscandance.com?subject=CCD×SOCIAL Sponsorship"
                  className="inline-block bg-transparent text-cream font-display text-lg px-7 py-4 border-4 border-cream hover:bg-cream/10 transition-colors"
                >
                  EMAIL US
                </a>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                { label: "Series Partner", desc: "All 3 shows + MEGA — headline presence everywhere" },
                { label: "Show Sponsor", desc: "Own a single night end to end" },
                { label: "Community Supporter", desc: "Light touch across all shows" },
              ].map((t) => (
                <Link
                  key={t.label}
                  to="/ccdxsocial/sponsor"
                  className="flex items-center justify-between gap-4 bg-cream text-ink border-4 border-cream chunk-shadow p-5 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
                >
                  <div>
                    <p className="font-display text-xl">{t.label}</p>
                    <p className="text-sm text-ink/70 mt-1">{t.desc}</p>
                  </div>
                  <span className="font-display text-sm">ENQUIRE →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── B2B STRIP ── */}
        <section className="bg-acid-yellow text-ink py-16 md:py-20">
          <div className="container grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="font-display text-sm text-magenta">/ FOR VENUES & PARTNERS</p>
              <h2 className="font-display text-4xl md:text-5xl leading-[0.95] mt-3">
                Want to see the full proposal?
              </h2>
              <p className="mt-4 text-base md:text-lg max-w-xl">
                Revenue structure, co-marketing plan, venue requirements, national expansion roadmap.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                to="/ccdxsocial/proposal"
                className="inline-block bg-ink text-cream font-display text-sm px-6 py-3 border-4 border-ink chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
              >
                VIEW PROPOSAL →
              </Link>
              <a
                href="mailto:hello@catscandance.com?subject=CCD×SOCIAL Partnership"
                className="inline-block bg-cream text-ink font-display text-sm px-6 py-3 border-4 border-ink hover:bg-acid-yellow transition-colors"
              >
                EMAIL US
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
