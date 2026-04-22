import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Playlist from "@/components/Playlist";
import Events from "@/components/Events";
// Media moved to its own page at /media
import Drops from "@/components/Drops";
import Instagram from "@/components/Instagram";
import Videos from "@/components/Videos";
import EarlyAccess from "@/components/EarlyAccess";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import PawCursor from "@/components/PawCursor";
import Catbot from "@/components/Catbot";
import SectionReveal from "@/components/SectionReveal";
import SEO from "@/components/SEO";
import MoonwalkCat from "@/components/MoonwalkCat";

const Index = () => {
  useSmoothScroll();
  return (
    <>
      <SEO
        title="Best Parties & Events in Bangalore | Cats Can Dance"
        description="Cats Can Dance — Bangalore's top event organisers. The best underground parties, dance music nights and electronic events in Bangalore, India. RSVP now."
        path="/"
        jsonLd={[
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
        <PawCursor />
        <Catbot />
        <MoonwalkCat />
        <Hero />
        <Marquee bg="bg-acid-yellow" />
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
