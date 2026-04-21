import { Helmet } from "react-helmet-async";

type Props = {
  title: string;
  description: string;
  path?: string;
};

const SITE = "https://catscandance.com";
const OG = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d0f4af56-ccde-4405-bf88-0d561f6d4f16/id-preview-80033f2e--53069b93-b992-401d-ae34-94f11e15c698.lovable.app-1776648638640.png";

const SEO = ({ title, description, path = "/" }: Props) => {
  const url = `${SITE}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={OG} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG} />
    </Helmet>
  );
};

export default SEO;
