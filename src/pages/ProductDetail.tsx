import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PRODUCT_BY_HANDLE_QUERY, storefrontApiRequest } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { CartDrawer } from "@/components/CartDrawer";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  useEffect(() => {
    (async () => {
      try {
        const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
        const p = data?.data?.product;
        setProduct(p);
        if (p?.variants?.edges?.[0]?.node?.id) {
          setSelectedVariantId(p.variants.edges[0].node.id);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [handle]);

  const variant = product?.variants?.edges?.find((e: any) => e.node.id === selectedVariantId)?.node;
  const img = product?.images?.edges?.[0]?.node;

  return (
    <>
      <SEO
        title={product ? `${product.title} — Cats Can Dance` : "Product"}
        description={product?.description?.slice(0, 155) || "Cats Can Dance drop"}
        path={`/product/${handle}`}
      />
      <main className="bg-cream text-ink min-h-screen">
        <Nav />
        <section className="container py-16 md:py-24 relative">
          <div className="absolute top-8 right-4 md:right-8 z-10">
            <CartDrawer />
          </div>
          <Link to="/shop" className="inline-flex items-center gap-2 mb-8 font-bold hover:text-magenta">
            <ArrowLeft className="w-4 h-4" /> BACK TO SHOP
          </Link>

          {loading ? (
            <div className="flex justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : !product ? (
            <p className="font-display text-3xl">PRODUCT NOT FOUND</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-12">
              <div className="aspect-square border-4 border-ink chunk-shadow bg-acid-yellow overflow-hidden">
                {img && <img src={img.url} alt={img.altText || product.title} className="w-full h-full object-cover" />}
              </div>
              <div>
                <h1 className="font-display text-5xl md:text-6xl mb-4 leading-[0.9]">{product.title}</h1>
                <p className="font-display text-3xl mb-6">
                  {variant?.price.currencyCode} {parseFloat(variant?.price.amount || "0").toFixed(2)}
                </p>
                <p className="text-lg mb-8 leading-relaxed">{product.description}</p>

                {product.options?.[0] && (
                  <div className="mb-8">
                    <p className="font-bold mb-3">{product.options[0].name.toUpperCase()}</p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.edges.map((e: any) => (
                        <button
                          key={e.node.id}
                          onClick={() => setSelectedVariantId(e.node.id)}
                          className={`px-4 py-2 border-4 border-ink font-bold transition-all ${
                            selectedVariantId === e.node.id
                              ? "bg-magenta text-cream"
                              : "bg-cream hover:bg-acid-yellow"
                          }`}
                        >
                          {e.node.selectedOptions[0]?.value || e.node.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() =>
                    variant &&
                    addItem({
                      product: { node: product },
                      variantId: variant.id,
                      variantTitle: variant.title,
                      price: variant.price,
                      quantity: 1,
                      selectedOptions: variant.selectedOptions || [],
                    })
                  }
                  disabled={!variant || isLoading}
                  size="lg"
                  className="w-full md:w-auto bg-ink text-cream border-4 border-ink hover:bg-magenta px-12"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ADD TO CART"}
                </Button>
              </div>
            </div>
          )}
        </section>
        <Footer />
      </main>
    </>
  );
};

export default ProductDetail;
