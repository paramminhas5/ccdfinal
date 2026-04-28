import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DiscoProvider } from "@/contexts/DiscoContext";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import ForVenues from "./pages/ForVenues.tsx";
import ForArtists from "./pages/ForArtists.tsx";
import ForInvestors from "./pages/ForInvestors.tsx";
import Admin from "./pages/Admin.tsx";
import Events from "./pages/Events.tsx";
import EventDetail from "./pages/EventDetail.tsx";
import Shop from "./pages/Shop.tsx";
import Pets from "./pages/Pets.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Blog from "./pages/Blog.tsx";
import MediaPage from "./pages/Media.tsx";
import Press from "./pages/Press.tsx";
import Playlists from "./pages/Playlists.tsx";
import VideosPage from "./pages/Videos.tsx";
import Embed from "./pages/Embed.tsx";
import NotFound from "./pages/NotFound.tsx";
import { useCartSync } from "@/hooks/useCartSync";
import ScrollToTop from "@/components/ScrollToTop";
import SeoVerification from "@/components/SeoVerification";

const queryClient = new QueryClient();

const CartSyncProvider = ({ children }: { children: React.ReactNode }) => {
  useCartSync();
  return <>{children}</>;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DiscoProvider>
            <CartSyncProvider>
              <ScrollToTop />
              <SeoVerification />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/for-venues" element={<ForVenues />} />
                <Route path="/for-artists" element={<ForArtists />} />
                <Route path="/for-investors" element={<ForInvestors />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:slug" element={<EventDetail />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/pets" element={<Pets />} />
                <Route path="/product/:handle" element={<ProductDetail />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/media" element={<MediaPage />} />
                <Route path="/press" element={<Press />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/videos" element={<VideosPage />} />
                <Route path="/embed/upcoming" element={<Embed />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CartSyncProvider>
          </DiscoProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
