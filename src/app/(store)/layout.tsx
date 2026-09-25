import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { NewsletterPopup } from "@/components/layout/NewsletterPopup";
import { INTRO_SCRIPT, Preloader } from "@/components/layout/Preloader";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grain flex min-h-screen flex-col">
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      <SmoothScroll>
        <Preloader />
        <AnnouncementBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <NewsletterPopup />
      </SmoothScroll>
    </div>
  );
}
