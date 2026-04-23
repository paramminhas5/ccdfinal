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

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Who organises the best parties in Bangalore?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Cats Can Dance is one of Bangalore's top independent event organisers, producing curated underground dance music parties and electronic events across the city.",
      },
    },
    {
      "@type": "Question",
      name: "Where can I find the best dance music events in Bangalore?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "All upcoming Cats Can Dance Episodes — Bangalore's leading underground dance music events — are listed at https://catscandance.com/events with free RSVP.",
      },
    },
    {
      "@type": "Question",
      name: "How do I RSVP to a Cats Can Dance event?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Visit https://catscandance.com/events, pick the upcoming Episode, and submit your name and email through the RSVP form. Capacity is limited.",
      },
    },
    {
      "@type": "Question",
      name: "Where is Cats Can Dance based?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Cats Can Dance is based in Bangalore, Karnataka, India and tours select Indian cities for special editions.",
      },
    },
  ],
};

const About = () => (
  <main className="bg-background text-foreground">
    <SEO
      title="About Cats Can Dance | Bangalore's Underground Crew"
      description="Dance music nights, limited apparel drops, and cool culture & streetwear out of Bangalore."
      path="/about"
      jsonLd={faqLd}
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
