import type { Owner } from "@/types";

/** Weight with a decimal comma ("28,4"). Null for unknown: 0 is stored when no weight was given. */
export function formatWeight(value?: number | null): string | null {
  if (!value) return null;
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

/** Compact age for tables and summaries ("3a 2m"), "—" when unknown. */
export function formatAgeShort(
  years?: number | null,
  months?: number | null,
): string {
  const parts: string[] = [];
  if (years) parts.push(`${years}a`);
  if (months) parts.push(`${months}m`);
  return parts.length ? parts.join(" ") : "—";
}

export function ownerFullName(owner?: Owner | null): string | null {
  if (!owner) return null;
  return `${owner.first_name} ${owner.last_name}`.trim() || null;
}
