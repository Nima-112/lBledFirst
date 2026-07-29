import type { SVGProps } from "react";

/**
 * Hand-drawn style line icons. Rough, slightly imperfect strokes with
 * round caps to feel artisanal rather than geometric.
 */
const base = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function HikingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 38c4-1 6-6 10-6s5 5 9 4 6-9 10-9 5 8 9 9" />
      <path d="M5 38h38" />
      <path d="M22 22l6-9 6 11" />
      <circle cx="33" cy="9" r="2.2" />
    </svg>
  );
}

export function CraftsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M16 41c-3-4-3-10 0-15 2-4 2-7 0-10" />
      <path d="M32 41c3-4 3-10 0-15-2-4-2-7 0-10" />
      <path d="M14 16c4-3 16-3 20 0" />
      <path d="M13 41h22" />
      <path d="M19 9c1 2 4 2 5 0" />
    </svg>
  );
}

export function CuisineIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M10 28c0-7 6-12 14-12s14 5 14 12" />
      <path d="M8 28h32" />
      <path d="M24 16V8" />
      <path d="M20 11c2-2 6-2 8 0" />
      <path d="M12 34c4 3 20 3 24 0" />
    </svg>
  );
}

export function AgricultureIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M24 40V18" />
      <path d="M24 24c-4 0-8-3-8-8 4 0 8 3 8 8z" />
      <path d="M24 22c4-1 9-4 9-9-5 0-9 4-9 9z" />
      <path d="M10 40c4-3 24-3 28 0" />
    </svg>
  );
}

export function FestivalsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M24 6v6" />
      <path d="M24 12l-12 26h24z" />
      <path d="M16 28c5 3 11 3 16 0" />
      <path d="M21 6h6" />
    </svg>
  );
}

export function HomestaysIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M8 24l16-13 16 13" />
      <path d="M12 22v17h24V22" />
      <path d="M20 39v-9h8v9" />
      <path d="M24 11V6" />
    </svg>
  );
}
