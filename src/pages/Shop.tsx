import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShopifyProduct, STOREFRONT_QUERY, storefrontApiRequest } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { CartDrawer } from "@/components/CartDrawer";
import PageHero from "@/components/PageHero";

const Shop = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  useEffect(() => {
    (async () => {
      try {
        const data = await storefrontApiRequest(STOREFRONT_QUERY, { first: 20, query: null });
        setProducts(data?.data?.products?.edges || []);
      } catch (e) {
        console.error("Failed to load products:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Cats Can Dance — Limited Streetwear Drops & Music Collectibles",
    description:
      "Limited streetwear drops, cat-graphic apparel and music collectibles from Cats Can Dance — a Bangalore streetwear brand. Heavyweight cotton, screen-printed in India, no restocks.",
    url: "https://catscandance.com/shop",
    inLanguage: "en-IN",
    isPartOf: { "@type": "WebSite", name: "Cats Can Dance", url: "https://catscandance.com" },
  };

  const brandLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: "Cats Can Dance",
    slogan: "Wear the culture.",
    url: "https://catscandance.com",
    logo: "https://catscandance.com/ccd-logo.png",
    category: "Streetwear",
  };

  const storeLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: "Cats Can Dance Shop",
    url: "https://catscandance.com/shop",
    image: "https://catscandance.com/og-image.png",
    description:
      "Online shop for Cats Can Dance — limited streetwear drops, music merchandise and collectibles from Bangalore, India.",
    areaServed: { "@type": "Country", name: "India" },
    paymentAccepted: ["Credit Card", "UPI", "Debit Card"],
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: products.length,
    itemListElement: products.slice(0, 20).map((p, i) => {
      const variant = p.node.variants.edges[0]?.node;
      const image = p.node.images.edges[0]?.node?.url;
      return {
        "@type": "ListItem",
        position: i + 1,
        url: `https://catscandance.com/product/${p.node.handle}`,
        item: {
          "@type": "Product",
          name: p.node.title,
          url: `https://catscandance.com/product/${p.node.handle}`,
          image,
          brand: { "@type": "Brand", name: "Cats Can Dance" },
          category: "Streetwear",
          offers: variant
            ? {
                "@type": "Offer",
                price: variant.price.amount,
                priceCurrency: variant.price.currencyCode,
                availability: "https://schema.org/InStock",
                url: `https://catscandance.com/product/${p.node.handle}`,
              }
            : undefined,
        },
      };
    }),
  };

  return (
    <>
      <SEO
        title="Cats Can Dance Shop — Limited Streetwear Drops & Music Collectibles | Bangalore"
        description="Limited streetwear drops, cat-graphic tees, hoodies and music collectibles from Cats Can Dance. Bangalore streetwear brand. Heavyweight cotton, screen-printed in India, no restocks."
        path="/shop"
        jsonLd={[collectionLd, brandLd, storeLd, ...(products.length ? [itemListLd] : [])]}
      />
      <main className="bg-cream text-ink">
        <Nav />
        <PageHero eyebrow="SHOP" title="DROPS & COLLECTIBLES." bg="bg-magenta" eyebrowColor="text-acid-yellow">
          <p className="font-display text-cream text-2xl mt-4">
            Limited streetwear drops & music collectibles. Made for the floor in Bangalore.
          </p>
        </PageHero>

        <section className="container py-16 md:py-24 relative">
          <div className="absolute top-8 right-4 md:right-8 z-10">
            <CartDrawer />
          </div>

          <h1 className="sr-only">
            Cats Can Dance Shop — Limited Streetwear Drops &amp; Music Collectibles in Bangalore, India
          </h1>
          <p className="sr-only">
            Browse the current Cats Can Dance drop. Heavyweight cotton tees, hoodies and caps, plus music collectibles
            tied to each Episode. Screen-printed in Bangalore. Limited quantities, no restocks.
          </p>

          {loading ? (
            <div className="flex justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-32 border-4 border-ink chunk-shadow bg-cream">
              <p className="font-display text-3xl mb-2">NO PRODUCTS YET</p>
              <p className="text-muted-foreground">Drop incoming.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-8">
              {products.map((p) => {
                const variant = p.node.variants.edges[0]?.node;
                const img = p.node.images.edges[0]?.node;
                return (
                  <article
                    key={p.node.id}
                    className="border-4 border-ink chunk-shadow bg-cream overflow-hidden hover:-translate-y-1 transition-transform"
                  >
                    <Link to={`/product/${p.node.handle}`} className="block">
                      <div className="aspect-square bg-acid-yellow border-b-4 border-ink overflow-hidden">
                        {img && (
                          <img
                            src={img.url}
                            alt={img.altText || `${p.node.title} — Cats Can Dance limited streetwear drop, Bangalore`}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </Link>
                    <div className="p-5">
                      <Link to={`/product/${p.node.handle}`}>
                        <h3 className="font-display text-2xl mb-1 hover:text-magenta transition-colors">
                          {p.node.title}
                        </h3>
                      </Link>
                      <p className="font-display text-xl mb-4">
                        {p.node.priceRange.minVariantPrice.currencyCode}{" "}
                        {parseFloat(p.node.priceRange.minVariantPrice.amount).toFixed(2)}
                      </p>
                      <Button
                        onClick={() =>
                          variant &&
                          addItem({
                            product: p,
                            variantId: variant.id,
                            variantTitle: variant.title,
                            price: variant.price,
                            quantity: 1,
                            selectedOptions: variant.selectedOptions || [],
                          })
                        }
                        disabled={!variant || isLoading}
                        className="w-full bg-ink text-cream border-4 border-ink hover:bg-magenta"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ADD TO CART"}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
        <Footer />
      </main>
    </>
  );
};

export default Shop;
