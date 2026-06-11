/**
 * CCD × SOCIAL — Public-facing 4-city tour landing page (/ccdxsocial).
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import SEO from "@/components/SEO";
import heroArt from "@/assets/ccdxsocial-hero.png.asset.json";
import blrPoster from "@/assets/ccdxsocial-blr-poster.jpg.asset.json";
import catDancer from "@/assets/cat-dancer.png";
import catHandstand from "@/assets/cat-handstand.png";
import catHeadphones from "@/assets/cat-headphones-dance.png";
import catRaver from "@/assets/cat-raver.png";

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

// Reusable scroll-reveal wrapper
const Reveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
);

// ── Artists on the decks ──────────────────────────────────────────────────────
const ARTISTS = [
  "SARTDAWG", "MERMAN", "DJAZZ", "HEDZ", "KAMARI", "VISHNU", "TANSANE", "+ MORE",
];

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
    lineup: "Lineup announced soon",
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
    lineup: "Lineup TBA",
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
    lineup: "Lineup TBA",
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
    lineup: "Headliner + residents + guests from every city",
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
    emoji: "🐾",
  },
  {
    eyebrow: "8 PM TILL LATE",
    title: "THE EVENING",
    body: "Dance floor opens inside. House, disco, breaks, UKG, DnB. CCD residents plus a rotating guest selector in every city.",
    bg: "bg-magenta",
    text: "text-cream",
    emoji: "🎧",
  },
  {
    eyebrow: "THE VIBE",
    title: "EASY SUNDAY",
    body: "No dress code, no posture. Free water and treat stations all day. Come for the dogs, stay for the music — or the other way round.",
    bg: "bg-acid-yellow",
    text: "text-ink",
    emoji: "☀️",
  },
  {
    eyebrow: "WHO IT'S FOR",
    title: "THE PACK",
    body: "Pet parents, music heads, friends of both, and anyone who wants a different kind of Sunday. Free entry on RSVP. Pets welcome at every stop.",
    bg: "bg-cream",
    text: "text-ink",
    emoji: "💛",
  },
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

// ── Floating scroll-cats (decorative parallax) ────────────────────────────────
function ScrollCats() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 3000], [0, -400]);
  const y2 = useTransform(scrollY, [0, 3000], [0, -700]);
  const y3 = useTransform(scrollY, [0, 3000], [0, -550]);
  const y4 = useTransform(scrollY, [0, 3000], [0, -900]);
  const rot1 = useTransform(scrollY, [0, 3000], [-8, 18]);
  const rot2 = useTransform(scrollY, [0, 3000], [10, -22]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[5] hidden md:block overflow-hidden">
      <motion.img src={catDancer} style={{ y: y1, rotate: rot1 }} className="absolute top-[120vh] -left-4 w-20 opacity-80" alt="" />
      <motion.img src={catHandstand} style={{ y: y2, rotate: rot2 }} className="absolute top-[180vh] right-2 w-24 opacity-80" alt="" />
      <motion.img src={catHeadphones} style={{ y: y3, rotate: rot1 }} className="absolute top-[260vh] left-4 w-24 opacity-80" alt="" />
      <motion.img src={catRaver} style={{ y: y4, rotate: rot2 }} className="absolute top-[340vh] right-6 w-28 opacity-80" alt="" />
    </div>
  );
}

export default function CcdxSocial() {
  const cd = useCountdown(NEXT_SHOW_DATE);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroArtY = useTransform(heroProgress, [0, 1], [0, 80]);
  const heroArtScale = useTransform(heroProgress, [0, 1], [1, 1.08]);

  return (
    <>
      <SEO
        title="CCD × SOCIAL — A 4-City Sunday Tour for Pets & Music"
        description="Cats Can Dance × Social: Bangalore, Mumbai, Hyderabad, Delhi NCR. Outdoor pet zone in the afternoon, underground dance music after dark. Free entry, RSVP only."
        path="/ccdxsocial"
        jsonLd={jsonLd}
      />
      <Nav />
      <ScrollCats />

      <main className="bg-cream text-ink relative">
        {/* ── HERO ── art integrated as background of the whole block */}
        <section ref={heroRef} className="relative bg-cream text-ink pt-24 md:pt-28 pb-12 md:pb-20 border-b-4 border-ink overflow-hidden">
          {/* Background art layer */}
          <motion.div
            style={{ y: heroArtY, scale: heroArtScale }}
            className="absolute inset-0 z-0"
          >
            <img
              src={heroArt.url}
              alt=""
              aria-hidden
              className="w-full h-full object-cover object-center"
            />
            {/* Soft fade so text on the left stays legible */}
            <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/85 md:via-cream/70 to-cream/10" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-cream to-transparent" />
          </motion.div>

          <div className="container relative z-10">
            <Reveal>
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="font-display text-xs px-3 py-1 bg-magenta text-cream border-4 border-ink chunk-shadow">National Tour</span>
                <span className="font-display text-xs px-3 py-1 bg-acid-yellow text-ink border-4 border-ink chunk-shadow">4 Cities · Jun–Oct 2026</span>
                <span className="font-display text-xs px-3 py-1 bg-electric-blue text-cream border-4 border-ink chunk-shadow">Free Entry · RSVP</span>
              </div>
            </Reveal>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="font-display leading-[0.85] tracking-tight text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] max-w-3xl"
            >
              <span className="block">CATS CAN</span>
              <span className="block">DANCE</span>
              <span className="block text-magenta">× SOCIAL</span>
            </motion.h1>

            <Reveal delay={0.15}>
              <p className="mt-8 max-w-xl text-lg md:text-xl text-ink/85 leading-relaxed bg-cream/80 backdrop-blur-sm p-2 -ml-2">
                A travelling Sunday party for pet parents and music lovers. Bangalore → Mumbai → Hyderabad → a grand finale in Delhi NCR. Outdoor pet zone in the afternoon, underground dance music after dark.
              </p>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="mt-8 flex flex-wrap items-end gap-4">
                {!cd.over && (
                  <div className="bg-ink text-cream border-4 border-ink chunk-shadow p-5">
                    <div className="font-display text-xs text-acid-yellow mb-3">▶ STOP 01 · BANGALORE IN</div>
                    <div className="flex gap-3">
                      {[
                        { val: cd.days, label: "DAYS" },
                        { val: cd.hours, label: "HRS" },
                        { val: cd.mins, label: "MIN" },
                        { val: cd.secs, label: "SEC" },
                      ].map(({ val, label }) => (
                        <div key={label} className="text-center">
                          <div className="font-display text-3xl md:text-4xl leading-none">{Pad(val)}</div>
                          <div className="font-display text-[10px] mt-1 text-cream/60">{label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="font-display text-[11px] mt-3 text-cream/70">SUN 28 JUN · SOCIAL INDIRANAGAR · 4 PM</div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/events"
                    className="inline-block bg-acid-yellow text-ink font-display text-lg px-7 py-4 border-4 border-ink chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
                  >
                    RSVP FREE →
                  </Link>
                  <a
                    href="#tour"
                    className="inline-block bg-magenta text-cream font-display text-lg px-7 py-4 border-4 border-ink chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
                  >
                    SEE THE TOUR ↓
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <Marquee
          bg="bg-acid-yellow"
          size="lg"
          items={["CCD × SOCIAL", "BANGALORE 28 JUN", "MUMBAI JULY", "HYDERABAD AUGUST", "DELHI FINALE", "FREE ENTRY · RSVP"]}
        />

        {/* ── HOW IT WORKS — visual & playful ── */}
        <section className="bg-cream py-20 md:py-28 border-b-4 border-ink relative overflow-hidden">
          <div className="container relative">
            <Reveal>
              <p className="font-display text-sm text-magenta">/ HOW IT WORKS</p>
              <h2 className="font-display text-5xl md:text-7xl leading-[0.9] mt-3">
                ONE SUNDAY.<br />TWO HALVES.
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-ink/80">
                Every stop runs the same shape. Afternoon for pets, evening for the floor, easy Sunday in between.
              </p>
            </Reveal>

            {/* Visual day-arc timeline */}
            <div className="mt-14 grid md:grid-cols-4 gap-6 relative">
              {/* connecting line */}
              <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-1 bg-ink/20 z-0" />
              {EXPECT.map((e, i) => (
                <motion.div
                  key={e.title}
                  initial={{ opacity: 0, y: 40, rotate: i % 2 === 0 ? -2 : 2 }}
                  whileInView={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -1.5 : 1.5 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.55, delay: i * 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
                  whileHover={{ rotate: 0, y: -4, transition: { duration: 0.2 } }}
                  className={`${e.bg} ${e.text} border-4 border-ink chunk-shadow p-6 relative z-10`}
                >
                  <div className="text-5xl mb-3" aria-hidden>{e.emoji}</div>
                  <p className="font-display text-xs opacity-80">{e.eyebrow}</p>
                  <h3 className="font-display text-2xl md:text-3xl mt-2">{e.title}</h3>
                  <p className="mt-3 text-sm md:text-base opacity-90">{e.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ON THE DECKS / ARTISTS ── */}
        <section className="bg-ink text-cream py-16 md:py-20 border-b-4 border-ink overflow-hidden">
          <div className="container">
            <Reveal>
              <p className="font-display text-sm text-acid-yellow">/ ON THE DECKS</p>
              <h2 className="font-display text-5xl md:text-7xl leading-[0.9] mt-3">
                THE <span className="text-magenta">SELECTORS</span>.
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-cream/80">
                Resident and guest selectors across the tour. Lineups announced city by city — here's the family you'll hear from.
              </p>
            </Reveal>
          </div>

          {/* Scrolling artist marquee */}
          <div className="mt-10 relative">
            <motion.div
              className="flex gap-4 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 28, ease: "linear", repeat: Infinity }}
            >
              {[...ARTISTS, ...ARTISTS].map((a, i) => (
                <span
                  key={`${a}-${i}`}
                  className={`font-display text-3xl md:text-5xl px-6 py-3 border-4 border-cream chunk-shadow shrink-0 ${
                    i % 3 === 0 ? "bg-acid-yellow text-ink" : i % 3 === 1 ? "bg-magenta text-cream" : "bg-electric-blue text-cream"
                  }`}
                >
                  {a}
                </span>
              ))}
            </motion.div>
          </div>

          <div className="container mt-10">
            <p className="text-sm text-cream/60">
              Genres on the floor: House · Disco · Breaks · UKG · DnB · Groove
            </p>
          </div>
        </section>

        {/* ── THE TOUR ── */}
        <section id="tour" className="bg-electric-blue text-cream py-20 md:py-28 border-b-4 border-ink">
          <div className="container">
            <Reveal>
              <p className="font-display text-sm text-acid-yellow">/ THE TOUR</p>
              <h2 className="font-display text-5xl md:text-7xl leading-[0.9] mt-3">FOUR CITIES.<br />ONE SUNDAY EACH.</h2>
              <p className="text-lg md:text-xl mt-4 max-w-2xl text-cream/85">
                Same format, different rooms. We start in Bangalore and end with a large-format finale in Delhi NCR.
              </p>
            </Reveal>

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
              {STOPS.map((stop, i) => (
                <motion.article
                  key={stop.slug}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
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
                    <p className="font-display text-xs opacity-80">LINEUP</p>
                    <p className="mt-1 text-sm opacity-95">{stop.lineup}</p>
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
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ── JUST PULL UP ── */}
        <section className="bg-acid-yellow text-ink py-20 md:py-28 border-b-4 border-ink relative overflow-hidden">
          <div className="container relative">
            <Reveal>
              <p className="font-display text-sm text-magenta">/ HOW TO JOIN</p>
              <h2 className="font-display text-6xl md:text-8xl leading-[0.85] mt-3 max-w-4xl">
                NO STEPS.<br />NO LISTS.<br /><span className="text-magenta">JUST PULL UP.</span>
              </h2>
              <p className="mt-6 max-w-2xl text-lg md:text-xl">
                RSVP free, show up Sunday, stay for the floor. Life's good. Pets and friends both welcome — no dress code, no cover, no nonsense.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/events"
                  className="inline-block bg-ink text-cream font-display text-xl md:text-2xl px-8 py-5 border-4 border-ink chunk-shadow-lg hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-transform"
                >
                  RSVP FREE →
                </Link>
                <a
                  href="https://wa.me/?text=Come%20to%20CCD%20%C3%97%20Social%20with%20me%20%E2%80%94%20https%3A%2F%2Fcatscandance.com%2Fccdxsocial"
                  target="_blank"
                  rel="noopener"
                  className="inline-block bg-cream text-ink font-display text-xl md:text-2xl px-8 py-5 border-4 border-ink chunk-shadow-lg hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-transform"
                >
                  BRING THE PACK →
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── FOR BRANDS ── punchy */}
        <section className="bg-ink text-cream py-20 md:py-28 border-b-4 border-ink">
          <div className="container grid lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <p className="font-display text-sm text-acid-yellow">/ FOR BRANDS</p>
              <h2 className="font-display text-5xl md:text-7xl leading-[0.85] mt-3">
                4 CITIES.<br />4 SUNDAYS.<br /><span className="text-magenta">ONE AUDIENCE</span><br />THAT SHOWS UP.
              </h2>
              <p className="mt-6 text-lg md:text-xl max-w-xl text-cream/85">
                Put your brand in the room — not on a banner outside it. We curate 2–3 partners per show. Pet-first or culture-first, always part of the experience.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/ccdxsocial/sponsor"
                  className="inline-block bg-acid-yellow text-ink font-display text-lg md:text-xl px-7 py-4 border-4 border-cream chunk-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform"
                >
                  BECOME A PARTNER →
                </Link>
                <a
                  href="mailto:hello@catscandance.com?subject=CCD×SOCIAL Sponsorship"
                  className="inline-block bg-transparent text-cream font-display text-lg md:text-xl px-7 py-4 border-4 border-cream hover:bg-cream hover:text-ink transition-colors"
                >
                  EMAIL US
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="grid gap-4">
                {[
                  { label: "Tour Partner", desc: "All four cities — headline presence everywhere", bg: "bg-magenta" },
                  { label: "City Sponsor", desc: "Own a single city end to end", bg: "bg-electric-blue" },
                  { label: "Community Supporter", desc: "Light touch across the tour", bg: "bg-acid-yellow text-ink" },
                ].map((t) => (
                  <Link
                    key={t.label}
                    to="/ccdxsocial/sponsor"
                    className={`flex items-center justify-between gap-4 ${t.bg} border-4 border-cream chunk-shadow p-5 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-transform`}
                  >
                    <div>
                      <p className="font-display text-xl md:text-2xl">{t.label}</p>
                      <p className="text-sm opacity-80 mt-1">{t.desc}</p>
                    </div>
                    <span className="font-display text-sm">ENQUIRE →</span>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
