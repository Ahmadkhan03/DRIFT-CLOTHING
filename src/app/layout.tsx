import type { Metadata } from "next";
import { Archivo, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { NewsletterPopup } from "@/components/layout/NewsletterPopup";
import { INTRO_SCRIPT, Preloader } from "@/components/layout/Preloader";

const interTight = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"] });
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "DRIFT — Streetwear, Made in Pakistan",
    template: "%s | DRIFT",
  },
  description: "Premium men's and unisex streetwear. Heavyweight hoodies, tees and jackets. Cash on delivery across Pakistan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${interTight.variable} ${archivo.variable} ${jetbrains.variable} antialiased`}
    >
      <body className="grain flex min-h-screen flex-col">
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
      </body>
    </html>
  );
}
