import { Hero } from "@/components/home/Hero";
import { ProductRail } from "@/components/home/ProductRail";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { DropCountdown } from "@/components/home/DropCountdown";
import { Editorial } from "@/components/home/Editorial";
import { Lookbook } from "@/components/home/Lookbook";
import { Values } from "@/components/home/Values";
import { Marquee } from "@/components/ui/Marquee";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee
        className="border-b border-line bg-bone py-4"
        duration={40}
        items={["New season", "Heavyweight essentials", "Made in Pakistan", "Cash on delivery", "Collection 01"].map((t) => (
          <span key={t} className="font-display text-3xl font-black uppercase md:text-4xl">
            {t}
          </span>
        ))}
        separator={<span className="mx-8 text-2xl text-maroon">✦</span>}
      />
      <ProductRail eyebrow="Just landed" title="New arrivals" />
      <CategoryTiles />
      <Editorial />
      <DropCountdown />
      <Lookbook />
      <Values />
    </>
  );
}
