"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/products";

type Point = { date: string; revenue: number; orders: number };

/** Single-series daily revenue bars with a per-bar hover tooltip and a table fallback. */
export function RevenueChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);

  const W = 720;
  const H = 220;
  const padL = 48;
  const padB = 24;
  const plotW = W - padL;
  const plotH = H - padB - 8;
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const nice = niceCeil(max);
  const ticks = [0, nice / 2, nice];
  const slot = plotW / data.length;
  const barW = Math.max(Math.min(slot - 2, 22), 2); // 2px surface gap between bars
  const y = (v: number) => 8 + plotH - (v / nice) * plotH;
  const label = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("en-PK", { day: "numeric", month: "short" });
  const every = Math.ceil(data.length / 6);

  if (asTable) {
    return (
      <div>
        <Toggle asTable onChange={setAsTable} />
        <div className="max-h-64 overflow-y-auto text-sm">
          <table className="w-full">
            <thead>
              <tr className="label text-left text-[10px] text-muted">
                <th className="py-2">Day</th>
                <th>Orders</th>
                <th className="text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[...data].reverse().map((d) => (
                <tr key={d.date}>
                  <td className="py-1.5">{label(d.date)}</td>
                  <td>{d.orders}</td>
                  <td className="text-right">{formatPrice(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const h = hover !== null ? data[hover] : null;

  return (
    <div>
      <Toggle asTable={false} onChange={setAsTable} />
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Daily revenue">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={padL} x2={W} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeDasharray={t === 0 ? undefined : "2 4"} />
              <text x={padL - 8} y={y(t) + 4} textAnchor="end" className="fill-muted text-[10px]">
                {t >= 1000 ? `${Math.round(t / 1000)}k` : t}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const x = padL + i * slot + (slot - barW) / 2;
            const top = y(d.revenue);
            const bh = 8 + plotH - top;
            const r = Math.min(4, barW / 2, bh);
            return (
              <g key={d.date}>
                {d.revenue > 0 && (
                  <path
                    d={`M${x},${top + bh} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW - r} Q${x + barW},${top} ${x + barW},${top + r} V${top + bh} Z`}
                    fill="var(--maroon)"
                    opacity={hover === null || hover === i ? 1 : 0.35}
                  />
                )}
                {i % every === 0 && (
                  <text x={x + barW / 2} y={H - 6} textAnchor="middle" className="fill-muted text-[10px]">
                    {label(d.date)}
                  </text>
                )}
                {/* Hit target: full column, bigger than the bar */}
                <rect
                  x={padL + i * slot}
                  y={0}
                  width={slot}
                  height={H - padB}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                />
              </g>
            );
          })}
        </svg>
        {h && hover !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 border border-line bg-paper px-3 py-2 text-xs shadow-sm"
            style={{ left: `${((padL + hover * slot + slot / 2) / W) * 100}%` }}
          >
            <p className="text-muted">{label(h.date)}</p>
            <p className="font-semibold">{formatPrice(h.revenue)}</p>
            <p className="text-muted">
              {h.orders} order{h.orders === 1 ? "" : "s"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Toggle({ asTable, onChange }: { asTable: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="mb-2 flex justify-end">
      <button onClick={() => onChange(!asTable)} className="text-[11px] text-muted underline underline-offset-4 hover:text-ink">
        {asTable ? "Show chart" : "Show as table"}
      </button>
    </div>
  );
}

function niceCeil(v: number) {
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / exp;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * exp;
}
