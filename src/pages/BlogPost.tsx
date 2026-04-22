import { useParams, Link, Navigate } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import BlogCover from "@/components/BlogCover";
import { getPost, getRelatedPosts } from "@/content/posts";

const BlogPost = () => {
  const { slug = "" } = useParams();
  const post = getPost(slug);

  if (!post) return <Navigate to="/" replace />;

  const related = getRelatedPosts(post.slug, 3);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: ["https://catscandance.com/og-image.png"],
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "en-IN",
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Cats Can Dance",
      logo: { "@type": "ImageObject", url: "https://catscandance.com/ccd-logo.png" },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://catscandance.com/blog/${post.slug}`,
    },
    about: ["dance music", "events in Bangalore", "underground parties India"],
  };

  return (
    <>
      <SEO
        title={`${post.title} — Cats Can Dance`}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        type="article"
        jsonLd={articleLd}
      />
      <main className="bg-background text-foreground min-h-screen">
        <Nav />
        <article className="pt-28 md:pt-32 pb-16">
          <div className="container max-w-3xl">
            <Breadcrumbs
              items={[
                { label: "Home", to: "/" },
                { label: "Blog", to: "/blog" },
                { label: post.title },
              ]}
            />
            <span className="inline-block bg-ink text-cream text-xs font-bold px-3 py-1 mb-4">{post.tag}</span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl text-ink mb-4 leading-[0.95] break-words">{post.title}</h1>
            <p className="font-display text-ink/70 text-sm mb-1">
              {post.date} · {post.author}
            </p>
            <p className="font-display text-ink/50 text-xs mb-8 italic">Honest, by humans, from Bangalore.</p>
            <div className="aspect-video w-full border-4 border-ink chunk-shadow-lg mb-10 overflow-hidden">
              <BlogCover title={post.title} tag={post.tag} kicker={post.kicker} issue={post.issue} color={post.coverColor} size="lg" className="border-0" />
            </div>

            {post.tldr && post.tldr.length > 0 && (
              <aside className="mb-10 bg-acid-yellow border-4 border-ink chunk-shadow p-5 sm:p-6">
                <p className="font-display text-ink text-xl sm:text-2xl mb-3">/ TL;DR</p>
                <ul className="space-y-2 list-none">
                  {post.tldr.map((t, i) => (
                    <li key={i} className="text-ink font-medium text-base sm:text-lg flex gap-3">
                      <span aria-hidden className="font-display text-magenta">→</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            )}

            <div className="space-y-6">
              {post.body.map((p, i) => {
                const insertPicks = post.quickPicks && i === Math.min(2, post.body.length - 1);
                const insertQuote = post.pullQuote && i === Math.min(Math.floor(post.body.length / 2), post.body.length - 1);
                return (
                  <div key={i} className="space-y-6">
                    <p
                      className="text-ink/85 font-medium text-base sm:text-lg leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: p.replace(/\*\*(.+?)\*\*/g, '<strong class="text-ink">$1</strong>'),
                      }}
                    />
                    {insertPicks && (
                      <aside className="bg-electric-blue text-cream border-4 border-ink chunk-shadow p-5 sm:p-6">
                        <p className="font-display text-acid-yellow text-base sm:text-lg mb-3">/ {post.quickPicks!.title}</p>
                        <ul className="space-y-2">
                          {post.quickPicks!.items.map((it, idx) => (
                            <li key={idx} className="font-medium text-cream/95 text-base sm:text-lg flex gap-3">
                              <span aria-hidden className="font-display text-acid-yellow">{idx + 1}.</span>
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
                      </aside>
                    )}
                    {insertQuote && (
                      <blockquote className="border-l-8 border-magenta pl-5 sm:pl-6 py-2 my-4">
                        <p className="font-display text-2xl sm:text-3xl md:text-4xl text-ink leading-[1.05]">
                          “{post.pullQuote}”
                        </p>
                      </blockquote>
                    )}
                  </div>
                );
              })}

              {post.whatWedSkip && (
                <aside className="mt-8 bg-magenta text-cream border-4 border-ink chunk-shadow p-5 sm:p-6">
                  <p className="font-display text-acid-yellow text-base sm:text-lg mb-2">/ WHAT WE'D SKIP</p>
                  <p className="font-medium text-cream/95 text-base sm:text-lg">{post.whatWedSkip}</p>
                </aside>
              )}

              <p className="mt-10 font-display text-ink text-sm sm:text-base border-t-4 border-ink pt-6">
                — Written by The Pack, on the floor in Bangalore.
              </p>
            </div>

            {related.length > 0 && (
              <aside className="mt-16 pt-10 border-t-4 border-ink">
                <h2 className="font-display text-2xl sm:text-3xl text-ink mb-6">/ READ NEXT</h2>
                <ul className="grid gap-4 sm:grid-cols-3">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link
                        to={`/blog/${r.slug}`}
                        className="block bg-cream border-4 border-ink chunk-shadow p-4 hover:-translate-y-1 hover:translate-x-1 transition-transform h-full"
                      >
                        <span className="inline-block bg-ink text-cream text-[10px] font-bold px-2 py-0.5 mb-2">
                          {r.tag}
                        </span>
                        <p className="font-display text-ink text-lg leading-tight">{r.title}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </article>
        <Footer />
      </main>
    </>
  );
};

export default BlogPost;
