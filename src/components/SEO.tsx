import { Helmet } from "react-helmet-async";

type Props = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
  type?: "website" | "article" | "product" | "event";
};

const SITE = "https://catscandance.com";
const DEFAULT_OG = `${SITE}/og-image.png`;

const SEO = ({ title, description, path = "/", image, jsonLd, type = "website" }: Props) => {
  const url = `${SITE}${path}`;
  const og = image ?? DEFAULT_OG;
  const ldArray = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type === "article" ? "article" : "website"} />
      <meta property="og:image" content={og} />
      <meta property="og:site_name" content="Cats Can Dance" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={og} />
      {ldArray.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
