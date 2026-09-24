/**
 * Brand intro, shown once per browser session.
 *
 * Pure CSS (see `.preloader` in globals.css) so it always clears, even if
 * JavaScript is slow. `INTRO_SCRIPT` runs before first paint and marks
 * <html data-intro="skip"> on repeat visits so it never flashes.
 */
export const INTRO_SCRIPT = `try{var k="drift-intro",d=document.documentElement;d.dataset.intro=sessionStorage.getItem(k)?"skip":"play";sessionStorage.setItem(k,"1")}catch(e){document.documentElement.dataset.intro="skip"}`;

export function Preloader() {
  return (
    <div aria-hidden className="preloader fixed inset-0 z-[200] flex flex-col justify-between bg-maroon-deep p-6 text-bone md:p-10">
      <p className="label text-bone/60">Collection 01 — Men / Unisex</p>
      <div className="flex items-end justify-between">
        <div className="overflow-hidden">
          <p className="preloader-word font-display text-[26vw] font-black uppercase leading-[0.8] md:text-[18vw]">Drift</p>
        </div>
        <p className="preloader-count font-mono text-sm tabular-nums" />
      </div>
    </div>
  );
}

/** Delay for hero entrance animations: wait for the intro only when it plays. */
export function introDelay(base: number) {
  if (typeof document === "undefined") return base;
  return document.documentElement.dataset.intro === "play" ? base : Math.max(base - 1.9, 0.1);
}
