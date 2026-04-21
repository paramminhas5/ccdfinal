import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Why from "@/components/Why";
import What from "@/components/What";
import WhyNow from "@/components/WhyNow";
import Audiences from "@/components/Audiences";
import Playlist from "@/components/Playlist";
import Events from "@/components/Events";
import EarlyAccess from "@/components/EarlyAccess";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Stats from "@/components/Stats";
import PawCursor from "@/components/PawCursor";
import ScrollPaw from "@/components/ScrollPaw";
import { DiscoProvider } from "@/contexts/DiscoContext";
import SectionReveal from "@/components/SectionReveal";

const Index = () => {
  useSmoothScroll();
  return (
    <DiscoProvider>
      <main className="bg-background text-foreground">
        <Nav />
        <PawCursor />
        <ScrollPaw />
        <Hero />
        <Marquee bg="bg-acid-yellow" />
        <SectionReveal><Why /></SectionReveal>
        <SectionReveal><Stats /></SectionReveal>
        <Marquee bg="bg-lime" reverse />
        <SectionReveal><What /></SectionReveal>
        <WhyNow />
        <Marquee bg="bg-orange" />
        <SectionReveal><Audiences /></SectionReveal>
        <Playlist />
        <SectionReveal><Events /></SectionReveal>
        <Marquee bg="bg-acid-yellow" />
        <SectionReveal><EarlyAccess /></SectionReveal>
        <Contact />
        <Footer />
      </main>
    </DiscoProvider>
  );
};

export default Index;
