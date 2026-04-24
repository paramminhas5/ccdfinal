import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Playlist from "@/components/Playlist";
import Events from "@/components/Events";
import Drops from "@/components/Drops";
import Instagram from "@/components/Instagram";
import Videos from "@/components/Videos";
import EarlyAccess from "@/components/EarlyAccess";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Catbot from "@/components/Catbot";
import SectionReveal from "@/components/SectionReveal";
import SectionDots from "@/components/SectionDots";
import SEO from "@/components/SEO";
import MoonwalkCat from "@/components/MoonwalkCat";

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
        <Marquee bg="bg-acid-yellow" size="lg" />
        <SectionReveal><About /></SectionReveal>
        <Marquee bg="bg-lime" reverse />
        <SectionReveal><Playlist /></SectionReveal>
        <SectionReveal><Events /></SectionReveal>
        <Marquee bg="bg-orange" />
        <SectionReveal><Drops /></SectionReveal>
        <SectionReveal><Instagram /></SectionReveal>
        <SectionReveal><Videos /></SectionReveal>
        <Marquee bg="bg-acid-yellow" />
        <SectionReveal><EarlyAccess /></SectionReveal>
        <Contact />
        <Footer />
      </main>
    </>
  );
};

export default Index;
