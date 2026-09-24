import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "ink" | "light" | "maroon" | "outline" | "outline-light";

const base =
  "group relative inline-flex items-center justify-center overflow-hidden px-8 h-12 label transition-colors duration-500 ease-[var(--ease-drift)] disabled:opacity-40 disabled:pointer-events-none";

const variants: Record<Variant, { root: string; fill: string }> = {
  ink: { root: "bg-ink text-bone hover:text-bone", fill: "bg-maroon" },
  light: { root: "bg-bone text-ink hover:text-bone", fill: "bg-maroon" },
  maroon: { root: "bg-maroon text-bone hover:text-bone", fill: "bg-ink" },
  outline: { root: "border border-ink text-ink hover:text-bone", fill: "bg-ink" },
  "outline-light": { root: "border border-bone/70 text-bone hover:text-ink", fill: "bg-bone" },
};

function Inner({ children, variant }: { children: ReactNode; variant: Variant }) {
  return (
    <>
      {/* Fill that wipes up from the bottom on hover */}
      <span
        aria-hidden
        className={`absolute inset-0 translate-y-full transition-transform duration-500 ease-[var(--ease-drift)] group-hover:translate-y-0 ${variants[variant].fill}`}
      />
      <span className="relative flex items-center gap-2">{children}</span>
    </>
  );
}

export function ButtonLink({
  variant = "ink",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return (
    <Link {...props} className={`${base} ${variants[variant].root} ${className}`}>
      <Inner variant={variant}>{children}</Inner>
    </Link>
  );
}

export function Button({
  variant = "ink",
  className = "",
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button {...props} className={`${base} ${variants[variant].root} ${className}`}>
      <Inner variant={variant}>{children}</Inner>
    </button>
  );
}
