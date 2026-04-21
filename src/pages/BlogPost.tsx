import { useParams, Link, Navigate } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { getPost } from "@/content/posts";

const BlogPost = () => {
  const { slug = "" } = useParams();
  const post = getPost(slug);

  if (!post) return <Navigate to="/" replace />;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: [post.cover],
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
        image={post.cover}
        type="article"
        jsonLd={articleLd}
      />
      <main className="bg-background text-foreground min-h-screen">
        <Nav />
        <article className="pt-32 pb-16">
          <div className="container max-w-3xl">
            <Link to="/" className="font-display text-magenta underline decoration-4 underline-offset-4 mb-6 inline-block">
              ← Back home
            </Link>
            <span className="inline-block bg-ink text-cream text-xs font-bold px-3 py-1 mb-4">{post.tag}</span>
            <h1 className="font-display text-5xl md:text-7xl text-ink mb-4 leading-[0.9]">{post.title}</h1>
            <p className="font-display text-ink/70 text-sm mb-8">
              {post.date} · {post.author}
            </p>
            <img
              src={post.cover}
              alt={post.title}
              className="w-full max-h-[520px] object-cover border-4 border-ink chunk-shadow-lg mb-10"
            />
            <div className="space-y-6">
              {post.body.map((p, i) => (
                <p key={i} className="text-ink/85 font-medium text-lg leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </article>
        <Footer />
      </main>
    </>
  );
};

export default BlogPost;
