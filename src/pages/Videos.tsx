import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Videos from "@/components/Videos";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";

const VideosPage = () => (
  <main className="bg-background text-foreground">
    <SEO
      title="Videos — Cats Can Dance | Sets, recaps & behind the scenes"
      description="Watch the tapes — live sets, event recaps and behind the scenes from the Cats Can Dance YouTube channel."
      path="/videos"
    />
    <Nav />
    <PageHero
      eyebrow="VIDEOS"
      title={<>WATCH<br/>THE TAPES.</>}
      bg="bg-lime"
      textColor="text-ink"
      eyebrowColor="text-magenta"
      shadow={false}
    />
    <div className="bg-cream border-b-4 border-ink pt-6">
      <div className="container">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Videos" }]} />
      </div>
    </div>
    <Videos />
    <Footer />
  </main>
);

export default VideosPage;
