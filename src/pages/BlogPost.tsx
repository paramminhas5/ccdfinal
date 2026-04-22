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
            <p className="font-display text-ink/70 text-sm mb-8">
              {post.date} · {post.author}
            </p>
            <div className="aspect-video w-full border-4 border-ink chunk-shadow-lg mb-10 overflow-hidden">
              <BlogCover title={post.title} tag={post.tag} color={post.coverColor} size="lg" className="border-0" />
            </div>
            <div className="space-y-6">
              {post.body.map((p, i) => (
                <p key={i} className="text-ink/85 font-medium text-base sm:text-lg leading-relaxed">
                  {p}
                </p>
              ))}
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
