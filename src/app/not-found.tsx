import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="font-display text-[30vw] font-black uppercase leading-[0.8] text-maroon md:text-[18vw]">404</p>
      <p className="label">This page drifted away</p>
      <ButtonLink href="/shop">Back to the shop</ButtonLink>
    </section>
  );
}
