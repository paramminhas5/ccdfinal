import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Why from "@/components/Why";
import WhyNow from "@/components/WhyNow";
import What from "@/components/What";
import Team from "@/components/Team";
import SectionReveal from "@/components/SectionReveal";
import Marquee from "@/components/Marquee";
import SEO from "@/components/SEO";

const About = () => (
  <main className="bg-background text-foreground">
    <SEO
      title="About — Cats Can Dance"
      description="Cats Can Dance unites dance music, pet culture and streetwear into one ecosystem of events, drops and community."
      path="/about"
    />
    <Nav />
    <PageHero
      eyebrow="ABOUT"
      title={<>WHO<br/>WE ARE.</>}
      bg="bg-magenta"
    />
    <SectionReveal><Why /></SectionReveal>
    <Marquee bg="bg-acid-yellow" />
    <SectionReveal><What /></SectionReveal>
    <SectionReveal><Team /></SectionReveal>
    <WhyNow />
    <Footer />
  </main>
);

export default About;
