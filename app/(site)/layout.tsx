import { CartProvider } from "@/components/providers/CartProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Preloader } from "@/components/layout/Preloader";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <CartProvider>
        <Preloader />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CartDrawer />
        <FloatingWhatsApp />
      </CartProvider>
    </SmoothScroll>
  );
}
