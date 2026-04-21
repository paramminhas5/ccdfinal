import { Link } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import Breadcrumbs from "@/components/Breadcrumbs";
import { posts } from "@/content/posts";

const Blog = () => {
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: posts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://catscandance.com/blog/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <>
      <SEO
        title="Blog — Best Parties, Events & DJs in Bangalore | Cats Can Dance"
        description="Long reads on Bangalore's underground party scene, top event organisers in India, and the DJs reshaping electronic music in Bangalore."
        path="/blog"
        jsonLd={itemListLd}
      />
      <main className="bg-background text-foreground min-h-screen">
        <Nav />
        <PageHero
          eyebrow="JOURNAL"
          title="THE BLOG."
          bg="bg-acid-yellow"
          textColor="text-ink"
          eyebrowColor="text-magenta"
          shadow={false}
        >
          <p className="text-ink/80 font-medium text-lg max-w-2xl">
            Long reads on Bangalore's underground scene, India's best event organisers, and the DJs you should know.
          </p>
        </PageHero>
        <section className="container py-16 md:py-20">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Blog" }]} />
          <div className="grid gap-6 max-w-4xl">
            {posts.map((p) => (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                className="block bg-cream border-4 border-ink chunk-shadow p-6 md:p-8 hover:-translate-y-1 hover:translate-x-1 transition-transform"
              >
                <span className="inline-block bg-ink text-cream text-xs font-bold px-3 py-1 mb-3">{p.tag}</span>
                <h2 className="font-display text-3xl md:text-5xl text-ink mb-2 leading-[0.95]">{p.title}</h2>
                <p className="text-ink/70 font-medium mb-3">{p.excerpt}</p>
                <p className="font-display text-ink/60 text-sm">
                  {p.date} · {p.author}
                </p>
              </Link>
            ))}
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
};

export default Blog;
