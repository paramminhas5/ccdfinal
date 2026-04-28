import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Playlist from "@/components/Playlist";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";

const Playlists = () => (
  <main className="bg-background text-foreground">
    <SEO
      title="Playlists — Cats Can Dance | What we play, on rotation"
      description="The Cats Can Dance playlists across Spotify, YouTube and SoundCloud — dance music, late-night sets and warehouse cuts."
      path="/playlists"
    />
    <Nav />
    <PageHero
      eyebrow="PLAYLISTS"
      title={<>NOW<br/>SPINNING.</>}
      bg="bg-magenta"
      textColor="text-cream"
      eyebrowColor="text-acid-yellow"
    />
    <div className="bg-cream border-b-4 border-ink pt-6">
      <div className="container">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Playlists" }]} />
      </div>
    </div>
    <Playlist />
    <Footer />
  </main>
);

export default Playlists;
