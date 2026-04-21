import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShopifyProduct, STOREFRONT_QUERY, storefrontApiRequest } from "@/lib/shopify";
import { ArrowRight } from "lucide-react";

const Drops = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await storefrontApiRequest(STOREFRONT_QUERY, { first: 4, query: null });
        setProducts(data?.data?.products?.edges || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <section id="drops" className="relative bg-cream border-b-4 border-ink py-24 md:py-32 bg-grain overflow-hidden">
      <div className="container">
        <p className="font-display text-magenta text-2xl md:text-3xl mb-4">/ DROPS · SHOP</p>
        <h2 className="font-display text-ink text-6xl md:text-8xl mb-12 leading-[0.9]">
          WEAR THE<br />CULTURE.
        </h2>

        {products.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            {products.slice(0, 2).map((p) => {
              const img = p.node.images.edges[0]?.node;
              return (
                <Link
                  key={p.node.id}
                  to={`/product/${p.node.handle}`}
                  className="border-4 border-ink chunk-shadow bg-acid-yellow overflow-hidden hover:-translate-y-1 transition-transform group"
                >
                  <div className="aspect-square bg-cream border-b-4 border-ink overflow-hidden">
                    {img && (
                      <img
                        src={img.url}
                        alt={img.altText || p.node.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-2xl mb-1">{p.node.title}</h3>
                    <p className="font-display text-lg">
                      {p.node.priceRange.minVariantPrice.currencyCode}{" "}
                      {parseFloat(p.node.priceRange.minVariantPrice.amount).toFixed(2)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            {[0, 1].map((i) => (
              <div key={i} className="aspect-[4/5] border-4 border-ink bg-acid-yellow animate-pulse" />
            ))}
          </div>
        )}

        <Link
          to="/shop"
          className="inline-flex items-center gap-3 bg-ink text-cream font-display text-2xl px-8 py-4 border-4 border-ink chunk-shadow hover:bg-magenta transition-colors"
        >
          SHOP THE DROP <ArrowRight className="w-6 h-6" />
        </Link>
      </div>
    </section>
  );
};

export default Drops;
