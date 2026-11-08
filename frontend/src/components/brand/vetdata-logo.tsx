// VetData logo: dog head on the forest tile. Colors are fixed brand values.
import type { SVGProps } from "react";

export function VetDataLogo({ size = 32, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="VetData" {...props}>
      <rect width="40" height="40" rx="10" fill="#2A3F2E" />
      <ellipse cx="11.6" cy="17" rx="4" ry="7.6" transform="rotate(18 11.6 17)" fill="#E5C658" />
      <ellipse cx="28.4" cy="17" rx="4" ry="7.6" transform="rotate(-18 28.4 17)" fill="#E5C658" />
      <ellipse cx="20" cy="20.2" rx="8.4" ry="9" fill="#F3DC7E" />
      <ellipse cx="20" cy="25.4" rx="4.6" ry="3.5" fill="#FBF3CF" />
      <ellipse cx="20" cy="23.6" rx="1.9" ry="1.35" fill="#2A3F2E" />
      <circle cx="16.4" cy="18.8" r="1.25" fill="#2A3F2E" />
      <circle cx="23.6" cy="18.8" r="1.25" fill="#2A3F2E" />
    </svg>
  );
}

// Mono mark (no tile) for forest backgrounds and 16px: color via currentColor (use lemon-300 on forest).
export function VetDataMark({ size = 16, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" {...props}>
      <ellipse cx="11.6" cy="17" rx="4" ry="7.6" transform="rotate(18 11.6 17)" fill="currentColor" opacity={0.7} />
      <ellipse cx="28.4" cy="17" rx="4" ry="7.6" transform="rotate(-18 28.4 17)" fill="currentColor" opacity={0.7} />
      <ellipse cx="20" cy="20.2" rx="8.4" ry="9" fill="currentColor" />
    </svg>
  );
}

// Lockup: <span className="inline-flex items-center gap-2.5 text-[22px] font-bold tracking-[-0.02em] text-foreground"><VetDataLogo size={36} />VetData</span>