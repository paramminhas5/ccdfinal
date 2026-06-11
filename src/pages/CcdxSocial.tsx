/**
 * CCD × SOCIAL — Public-facing 4-city tour landing page (/ccdxsocial).
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import SEO from "@/components/SEO";
import catSocialHero from "@/assets/cat-social-hero.png";
import blrPoster from "@/assets/ccdxsocial-blr-poster.jpg.asset.json";

// ── Countdown ─────────────────────────────────────────────────────────────────
const NEXT_SHOW_DATE = new Date("2026-06-28T10:30:00Z"); // 4 PM IST, Sun 28 Jun 2026

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

// ── Tour stops ────────────────────────────────────────────────────────────────
const STOPS = [
  {
    num: "01",
    slug: "ccdxsocial-blr",
    city: "BANGALORE",
    venue: "Social, Indiranagar",
    date: "Sun, 28 Jun 2026 · 4 PM till late",
    tagline: "The launch · where it all begins",
    desc: "Our home crowd, our first room. Outdoor pet zone from 4 PM with a vendor market, lookalike contest and portrait booth — dance floor opens inside at 8.",
    music: "Startdawg b2b Merman · plus a BLR opener",
    bg: "bg-electric-blue",
    text: "text-cream",
    accent: "text-acid-yellow",
    badge: "next" as const,
    poster: true,
  },
  {
    num: "02",
    slug: "ccdxsocial-mum",
    city: "MUMBAI",
    venue: "Antisocial, Khar",
    date: "Last Sunday of July 2026",
    tagline: "The style stop · midsummer energy",
    desc: "Mumbai brings the looks. Best-dressed contest (pets included), live grooming demo, and a photo corner that doubles as a portrait studio.",
    music: "Startdawg b2b Merman · plus a Mumbai guest (TBA)",
    bg: "bg-magenta",
    text: "text-cream",
    accent: "text-acid-yellow",
    badge: null,
    poster: false,
  },
  {
    num: "03",
    slug: "ccdxsocial-hyd",
    city: "HYDERABAD",
    venue: "Social, Hyderabad",
    date: "Last Sunday of August 2026",
    tagline: "The agility stop · pre-finale",
    desc: "The most physical edition. Two agility courses, timed speed runs, performance contest. Hyderabad's underground takes the late slot.",
    music: "Startdawg b2b Merman · plus a HYD guest (TBA)",
    bg: "bg-ink",
    text: "text-cream",
    accent: "text-acid-yellow",
    badge: null,
    poster: false,
  },
  {
    num: "★",
    slug: "ccdxsocial-delhi",
    city: "DELHI / NCR",
    venue: "Venue TBA — large format",
    date: "October 2026 (date soon)",
    tagline: "The grand finale · season closer",
    desc: "Everything the tour has been building toward. Outdoor stage, pet runway, agility finals, full lineup. One last Sunday with the whole pack in one place.",
    music: "Full lineup TBA — headliner + residents + guests from every city",
    bg: "bg-acid-yellow",
    text: "text-ink",
    accent: "text-magenta",
    badge: "finale" as const,
    poster: false,
  },
];

// ── What to expect (4 blocks) ─────────────────────────────────────────────────
const EXPECT = [
  {
    eyebrow: "4–8 PM",
    title: "THE AFTERNOON",
    body: "Outdoor pet zone. Agility course, portrait booth, treat bar, vendor market, lookalike + best-dressed contests rotating each city. Bring your dog or just come hang.",
    bg: "bg-electric-blue",
    text: "text-cream",
  },
  {
    eyebrow: "8 PM TILL LATE",
    title: "THE EVENING",
    body: "Dance floor opens inside. House, disco, breaks, UKG, DnB. One CCD resident, one open-deck slot, one local guest, and a legend of the game on the late slot.",
    bg: "bg-magenta",
    text: "text-cream",
  },
  {
    eyebrow: "THE VIBE",
    title: "EASY SUNDAY",
    body: "No dress code, no posture. Free water and treat stations all day. Come for the dogs, stay for the music — or the other way round.",
    bg: "bg-acid-yellow",
    text: "text-ink",
  },
  {
    eyebrow: "WHO IT'S FOR",
    title: "THE PACK",
    body: "Pet parents, music heads, friends of both, and anyone who wants a different kind of Sunday. Free entry on RSVP. Pets welcome at every stop.",
    bg: "bg-cream",
    text: "text-ink",
  },
];

// ── How to join ───────────────────────────────────────────────────────────────
const STEPS = [
  { n: "1", title: "PICK YOUR CITY", body: "Find your stop on the tour below. Tap RSVP — it's free." },
  { n: "2", title: "SHOW UP SUNDAY", body: "Doors at 4 PM. Bring your pet (or just yourself). Treats and water on us." },
  { n: "3", title: "STAY FOR THE FLOOR", body: "Music kicks in at 8 PM and runs till late. Same crew every city." },
];

// ── JSON-LD ───────────────────────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EventSeries",
  name: "CCD × SOCIAL",
  description:
    "Cats Can Dance × Social — a four-city Sunday tour for pet parents and music lovers. Pet zone in the afternoon, underground dance music after dark.",
  url: "https://catscandance.com/ccdxsocial",
  organizer: { "@type": "Organization", name: "Cats Can Dance", url: "https://catscandance.com" },
  subEvent: [
    { "@type": "Event", name: "CCD × SOCIAL — Bangalore", startDate: "2026-06-28", location: { "@type": "Place", name: "Social, Indiranagar", address: "Bengaluru, IN" } },
    { "@type": "Event", name: "CCD × SOCIAL — Mumbai", startDate: "2026-07-26", location: { "@type": "Place", name: "Antisocial, Khar", address: "Mumbai, IN" } },
    { "@type": "Event", name: "CCD × SOCIAL — Hyderabad", startDate: "2026-08-30", location: { "@type": "Place", name: "Social, Hyderabad", address: "Hyderabad, IN" } },
    { "@type": "Event", name: "CCD × SOCIAL — Delhi NCR (Finale)", startDate: "2026-10-01", location: { "@type": "Place", name: "TBA", address: "Delhi NCR, IN" } },
  ],
};

export default function CcdxSocial() {
  const cd = useCountdown(NEXT_SHOW_DATE);

  return (
    <>
      <SEO
        title="CCD × SOCIAL — A 4-City Sunday Tour for Pets & Music"
        description="Cats Can Dance × Social: Bangalore, Mumbai, Hyderabad, Delhi NCR. Outdoor pet zone in the afternoon, underground dance music after dark. Free entry, RSVP only."
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
                  <span className="font-display text-xs px-3 py-1 bg-magenta text-cream border-4 border-cream chunk-shadow">National Tour</span>
                  <span className="font-display text-xs px-3 py-1 bg-acid-yellow text-ink border-4 border-cream chunk-shadow">4 Cities · Jun–Oct 2026</span>
                  <span className="font-display text-xs px-3 py-1 bg-electric-blue text-cream border-4 border-cream chunk-shadow">Free Entry · RSVP</span>
                </div>

                <h1 className="font-display leading-[0.85] tracking-tight text-6xl sm:text-7xl md:text-8xl lg:text-9xl">
                  <span className="block">CATS</span>
                  <span className="block">CAN</span>
                  <span className="block text-acid-yellow">DANCE</span>
                  <span className="block text-magenta">× SOCIAL</span>
                </h1>

                <p className="mt-8 max-w-xl text-lg md:text-xl text-cream/85 leading-relaxed">
                  A travelling Sunday party for pet parents and music lovers. We start in Bangalore,
                  then Mumbai, then Hyderabad — and close it out with a grand finale in Delhi NCR.
                  Outdoor pet zone in the afternoon, underground dance music after dark, same crew every city.
                </p>

                {/* Countdown */}
                {!cd.over ? (
                  <div className="mt-8 inline-block bg-cream text-ink border-4 border-cream chunk-shadow p-5">
                    <div className="font-display text-xs text-magenta mb-3">▶ STOP 01 · BANGALORE IN</div>
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
                    <div className="font-display text-[11px] mt-3 text-ink/70">SUN 28 JUN · SOCIAL INDIRANAGAR · 4 PM</div>
                  </div>
                ) : (
                  <div className="mt-8">
                    <p className="font-display text-sm text-magenta">/ NEXT STOP</p>
                    <p className="font-display text-3xl mt-2">BANGALORE — STOP 01</p>
                    <p className="text-cream/80 mt-1">Sun, 28 Jun 2026 · Social Indiranagar</p>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/events"
                    className="inline-block bg-acid-yellow text-ink font-display text-lg px-7 py-4 border-4 border-cream chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
                  >
                    RSVP FREE →
                  </Link>
                  <a
                    href="#tour"
                    className="inline-block bg-magenta text-cream font-display text-lg px-7 py-4 border-4 border-cream chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
                  >
                    SEE THE TOUR ↓
                  </a>
                </div>
              </div>

              {/* Right — Social-themed hero cat */}
              <div className="relative">
                <div className="bg-electric-blue border-4 border-cream chunk-shadow-lg p-4 rotate-[-2deg]">
                  <img
                    src={catSocialHero}
                    alt="DJ cat at Social — CCD × SOCIAL tour"
                    width={1024}
                    height={1024}
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
          items={["CCD × SOCIAL", "BANGALORE 28 JUN", "MUMBAI JULY", "HYDERABAD AUGUST", "DELHI FINALE", "FREE ENTRY · RSVP"]}
        />

        {/* ── WHAT TO EXPECT ── */}
        <section className="bg-cream py-20 md:py-28 border-b-4 border-ink">
          <div className="container">
            <p className="font-display text-sm text-magenta">/ WHAT TO EXPECT</p>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9] mt-3">
              HOW IT WORKS.
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-ink/80">
              Every stop runs the same shape: an outdoor afternoon for pets, an indoor evening for music,
              and one long, easy Sunday in between. What changes city to city is the room, the guests, and the contests.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-12">
              {EXPECT.map((e) => (
                <div key={e.title} className={`${e.bg} ${e.text} border-4 border-ink chunk-shadow p-6 md:p-8`}>
                  <p className="font-display text-xs opacity-80">{e.eyebrow}</p>
                  <h3 className="font-display text-3xl md:text-4xl mt-2">{e.title}</h3>
                  <p className="mt-4 text-base md:text-lg opacity-90">{e.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THE TOUR ── */}
        <section id="tour" className="bg-electric-blue text-cream py-20 md:py-28 border-b-4 border-ink">
          <div className="container">
            <p className="font-display text-sm text-acid-yellow">/ THE TOUR</p>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9] mt-3">FOUR CITIES.<br />ONE SUNDAY EACH.</h2>
            <p className="text-lg md:text-xl mt-4 max-w-2xl text-cream/85">
              Same format, different rooms. We start in Bangalore and end with a large-format finale in Delhi NCR.
            </p>

            {/* Step progress bar (desktop) */}
            <div className="hidden md:flex items-center mt-12 mb-10">
              {STOPS.map((stop, i) => (
                <div key={stop.slug} className="flex items-center flex-1 last:flex-none">
                  <div
                    className={`w-14 h-14 grid place-items-center border-4 border-cream chunk-shadow font-display text-lg ${
                      stop.badge === "next" ? "bg-acid-yellow text-ink" : stop.badge === "finale" ? "bg-magenta text-cream" : "bg-ink text-cream"
                    }`}
                  >
                    {stop.num}
                  </div>
                  {i < STOPS.length - 1 && <div className="flex-1 h-1 bg-cream/40 mx-2" />}
                </div>
              ))}
            </div>

            {/* Stop cards */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {STOPS.map((stop) => (
                <article
                  key={stop.slug}
                  className={`relative ${stop.bg} ${stop.text} border-4 border-cream chunk-shadow p-6 md:p-8`}
                >
                  {stop.badge === "next" && (
                    <span className="absolute -top-4 left-4 bg-acid-yellow text-ink font-display text-xs px-3 py-1 border-4 border-ink chunk-shadow">
                      ▶ YOU ARE HERE · NEXT UP
                    </span>
                  )}
                  {stop.badge === "finale" && (
                    <span className="absolute -top-4 left-4 bg-magenta text-cream font-display text-xs px-3 py-1 border-4 border-ink chunk-shadow">
                      ★ GRAND FINALE
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`font-display text-6xl md:text-7xl leading-none ${stop.accent}`}>{stop.num}</p>
                      <h3 className="font-display text-3xl md:text-4xl leading-tight mt-2">{stop.city}</h3>
                      <p className={`font-display text-sm mt-1 ${stop.accent}`}>{stop.tagline}</p>
                    </div>
                  </div>

                  {stop.poster && (
                    <div className="mt-5 border-4 border-cream chunk-shadow overflow-hidden">
                      <img
                        src={blrPoster.url}
                        alt="CCD × Social Bangalore poster — 28 June 2026 at Social Indiranagar"
                        className="w-full h-auto block"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <p className="mt-4 text-base opacity-90">{stop.desc}</p>

                  <div className="mt-5 border-t-2 border-cream/30 pt-4">
                    <p className="font-display text-xs opacity-80">MUSIC</p>
                    <p className="mt-1 text-sm opacity-95">{stop.music}</p>
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-3">
                    <div>
                      <p className="font-display text-sm">{stop.date}</p>
                      <p className="text-xs opacity-80">{stop.venue}</p>
                    </div>
                    <Link
                      to="/events"
                      className="inline-block bg-cream text-ink font-display text-xs px-4 py-2 border-4 border-ink chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
                    >
                      {stop.badge === "next" ? "RSVP FREE →" : stop.badge === "finale" ? "GET NOTIFIED →" : "RSVP →"}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── MUSIC ── */}
        <section className="bg-ink text-cream py-20 md:py-28 border-b-4 border-ink">
          <div className="container grid lg:grid-cols-[1fr_1.2fr] gap-12 items-start">
            <div>
              <p className="font-display text-sm text-acid-yellow">/ WHAT YOU'LL HEAR</p>
              <h2 className="font-display text-5xl md:text-7xl leading-[0.9] mt-3">THE FLOOR.</h2>
            </div>
            <div>
              <div className="flex flex-wrap gap-2 mb-6">
                {["House", "Groove", "Disco", "Breaks", "UKG", "DnB"].map((g) => (
                  <span key={g} className="font-display text-xs px-3 py-2 bg-electric-blue text-cream border-4 border-cream chunk-shadow">
                    {g}
                  </span>
                ))}
              </div>
              <p className="text-lg text-cream/85 leading-relaxed">
                <span className="text-acid-yellow font-display">Startdawg b2b Merman</span> are the residents — they play every stop.
                Each city gets a local guest on warmup and a legend of the game on the late slot.
                One open-deck spot per show keeps a door open for the next name up.
              </p>
              <p className="mt-4 text-base text-cream/70">
                Doors at 8 PM, music till close. Same energy, different room.
              </p>
            </div>
          </div>
        </section>

        {/* ── HOW TO JOIN ── */}
        <section className="bg-acid-yellow text-ink py-20 md:py-28 border-b-4 border-ink">
          <div className="container">
            <p className="font-display text-sm text-magenta">/ HOW TO JOIN</p>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9] mt-3">THREE STEPS.</h2>
            <p className="mt-4 max-w-2xl text-lg">
              Free entry at every stop. RSVP holds your spot — pets and friends are both welcome.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {STEPS.map((s) => (
                <div key={s.n} className="bg-ink text-cream border-4 border-ink chunk-shadow p-6">
                  <p className="font-display text-5xl text-acid-yellow">{s.n}</p>
                  <h3 className="font-display text-2xl mt-3">{s.title}</h3>
                  <p className="mt-2 text-base text-cream/85">{s.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/events"
                className="inline-block bg-ink text-cream font-display text-lg px-7 py-4 border-4 border-ink chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
              >
                RSVP FREE →
              </Link>
              <a
                href="https://wa.me/?text=Come%20to%20CCD%20%C3%97%20Social%20with%20me%20%E2%80%94%20https%3A%2F%2Fcatscandance.com%2Fccdxsocial"
                target="_blank"
                rel="noopener"
                className="inline-block bg-cream text-ink font-display text-lg px-7 py-4 border-4 border-ink chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
              >
                BRING A FRIEND →
              </a>
            </div>
          </div>
        </section>

        {/* ── FOR SPONSORS ── */}
        <section className="bg-cream text-ink py-20 md:py-28 border-b-4 border-ink">
          <div className="container grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="font-display text-sm text-magenta">/ FOR BRANDS</p>
              <h2 className="font-display text-5xl md:text-7xl leading-[0.9] mt-3">
                A NOTE FOR<br />SPONSORS.
              </h2>
              <p className="mt-6 text-lg max-w-xl">
                Want your brand at all four cities? We curate two to three partners per show — pet-first or culture-first,
                always part of the room rather than a banner on it. One deck, four cities, one consistent audience.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/ccdxsocial/sponsor"
                  className="inline-block bg-magenta text-cream font-display text-lg px-7 py-4 border-4 border-ink chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
                >
                  SEE SPONSOR TIERS →
                </Link>
                <a
                  href="mailto:hello@catscandance.com?subject=CCD×SOCIAL Sponsorship"
                  className="inline-block bg-ink text-cream font-display text-lg px-7 py-4 border-4 border-ink hover:bg-ink/90 transition-colors"
                >
                  EMAIL US
                </a>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                { label: "Tour Partner", desc: "All four cities — headline presence everywhere" },
                { label: "City Sponsor", desc: "Own a single city end to end" },
                { label: "Community Supporter", desc: "Light touch across the tour" },
              ].map((t) => (
                <Link
                  key={t.label}
                  to="/ccdxsocial/sponsor"
                  className="flex items-center justify-between gap-4 bg-ink text-cream border-4 border-ink chunk-shadow p-5 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
                >
                  <div>
                    <p className="font-display text-xl">{t.label}</p>
                    <p className="text-sm text-cream/70 mt-1">{t.desc}</p>
                  </div>
                  <span className="font-display text-sm text-acid-yellow">ENQUIRE →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
