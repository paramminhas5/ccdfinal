import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import MarqueeBySlot from "@/components/MarqueeBySlot";
import About from "@/components/About";
import Events from "@/components/Events";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Catbot from "@/components/Catbot";
import SectionReveal from "@/components/SectionReveal";
import SectionDots from "@/components/SectionDots";
import SEO from "@/components/SEO";
import MoonwalkCat from "@/components/MoonwalkCat";

const Playlist = lazy(() => import("@/components/Playlist"));
const Drops = lazy(() => import("@/components/Drops"));
const Instagram = lazy(() => import("@/components/Instagram"));
const Videos = lazy(() => import("@/components/Videos"));
const EarlyAccess = lazy(() => import("@/components/EarlyAccess"));

const SectionFallback = ({ bg = "bg-cream" }: { bg?: string }) => (
  <div className={`${bg} border-b-4 border-ink min-h-[220px] animate-pulse`} aria-hidden />
);

const Index = () => {
  useSmoothScroll();
  const location = useLocation();
  useEffect(() => {
    if (location.hash === "#early-access") {
      setTimeout(() => {
        document.getElementById("early-access")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [location.hash]);
  return (
    <>
      <SEO
        title="Cats Can Dance — Bangalore Underground Parties, Apparel & Culture"
        description="Bangalore's underground crew. Dance music nights, limited apparel drops, CCD goods, and cool culture & streetwear. RSVP, shop, join the pack."
        path="/"
        keywords="bangalore parties, underground events bangalore, dance music bangalore, streetwear india, apparel drops, cool culture, electronic music bangalore, cats can dance"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Cats Can Dance",
            url: "https://catscandance.com",
            logo: "https://catscandance.com/og-image.png",
            description: "Bangalore underground crew — dance music nights, limited apparel drops, CCD goods, and cool culture & streetwear.",
            sameAs: ["https://instagram.com/catscandance"],
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://catscandance.com/" },
              { "@type": "ListItem", position: 2, name: "Events", item: "https://catscandance.com/events" },
              { "@type": "ListItem", position: 3, name: "Shop", item: "https://catscandance.com/shop" },
            ],
          },
        ]}
      />
      <main className="bg-background text-foreground">
        <Nav />
        <SectionDots />
        <Catbot />
        <MoonwalkCat />
        <Hero />
        <MarqueeBySlot id="above-about" />
        <SectionReveal><About /></SectionReveal>
        <MarqueeBySlot id="above-events" />
        <SectionReveal><Events /></SectionReveal>
        <MarqueeBySlot id="above-videos" />
        <Suspense fallback={<SectionFallback bg="bg-ink" />}>
          <SectionReveal><Videos /></SectionReveal>
        </Suspense>
        <MarqueeBySlot id="above-playlist" />
        <Suspense fallback={<SectionFallback bg="bg-magenta" />}>
          <SectionReveal><Playlist /></SectionReveal>
        </Suspense>
        <MarqueeBySlot id="above-drops" />
        <Suspense fallback={<SectionFallback bg="bg-cream" />}>
          <SectionReveal><Drops /></SectionReveal>
        </Suspense>
        <MarqueeBySlot id="above-instagram" />
        <Suspense fallback={<SectionFallback bg="bg-magenta" />}>
          <SectionReveal><Instagram /></SectionReveal>
        </Suspense>
        <MarqueeBySlot id="above-early-access" />
        <Suspense fallback={<SectionFallback bg="bg-electric-blue" />}>
          <SectionReveal><EarlyAccess /></SectionReveal>
        </Suspense>
        <Contact />
        <Footer />
      </main>
    </>
  );
};

export default Index;
