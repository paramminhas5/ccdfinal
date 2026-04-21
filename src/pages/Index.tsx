import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Playlist from "@/components/Playlist";
import Events from "@/components/Events";
import Media from "@/components/Media";
import Drops from "@/components/Drops";
import Instagram from "@/components/Instagram";
import Posts from "@/components/Posts";
import EarlyAccess from "@/components/EarlyAccess";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import PawCursor from "@/components/PawCursor";
import ScrollPaw from "@/components/ScrollPaw";
import { DiscoProvider } from "@/contexts/DiscoContext";
import SectionReveal from "@/components/SectionReveal";
import SEO from "@/components/SEO";

const Index = () => {
  useSmoothScroll();
  return (
    <DiscoProvider>
      <SEO
        title="Cats Can Dance — So Can You"
        description="A culture brand uniting dance music, pet culture and streetwear. Drops, events, playlists and a community that shows up."
        path="/"
      />
      <main className="bg-background text-foreground">
        <Nav />
        <PawCursor />
        <ScrollPaw />
        <Hero />
        <Marquee bg="bg-acid-yellow" />
        <SectionReveal><About /></SectionReveal>
        <Marquee bg="bg-lime" reverse />
        <SectionReveal><Playlist /></SectionReveal>
        <SectionReveal><Events /></SectionReveal>
        <Marquee bg="bg-orange" />
        <SectionReveal><Media /></SectionReveal>
        <SectionReveal><Drops /></SectionReveal>
        <SectionReveal><Instagram /></SectionReveal>
        <SectionReveal><Posts /></SectionReveal>
        <Marquee bg="bg-acid-yellow" />
        <SectionReveal><EarlyAccess /></SectionReveal>
        <Contact />
        <Footer />
      </main>
    </DiscoProvider>
  );
};

export default Index;
