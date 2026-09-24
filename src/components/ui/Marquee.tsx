import type { ReactNode } from "react";

export function Marquee({
  items,
  duration = 30,
  className = "",
  separator = <span className="mx-8 opacity-60">✦</span>,
}: {
  items: ReactNode[];
  duration?: number;
  className?: string;
  separator?: ReactNode;
}) {
  // Content is rendered twice so the -50% translate loops seamlessly.
  const run = items.map((item, i) => (
    <span key={i} className="flex items-center whitespace-nowrap">
      {item}
      {separator}
    </span>
  ));

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className="animate-marquee flex w-max hover:[animation-play-state:paused]"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        <div className="flex">{run}</div>
        <div className="flex" aria-hidden>
          {run}
        </div>
      </div>
    </div>
  );
}
