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

  return (
    <>
      <SEO title="Shop — Cats Can Dance" description="Limited drops, made for the dance floor." path="/shop" />
      <main className="bg-cream text-ink">
        <Nav />
        <PageHero eyebrow="SHOP" title="WEAR THE CULTURE." bg="bg-magenta" eyebrowColor="text-acid-yellow">
          <p className="font-display text-cream text-2xl mt-4">Limited drops. Made for the floor.</p>
        </PageHero>

        <section className="container py-16 md:py-24 relative">
          <div className="absolute top-8 right-4 md:right-8 z-10">
            <CartDrawer />
          </div>

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
                            alt={img.altText || p.node.title}
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
