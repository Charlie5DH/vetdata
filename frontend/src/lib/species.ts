/**
 * Patient species are captured in Portuguese ("Cachorro", "Gato"), while the
 * vaccine catalog stores canonical species keys in English ("dog", "cat").
 * This helper bridges the two so vaccine filters work regardless of how the
 * species was entered.
 */

const SPECIES_ALIASES: Record<string, string> = {
  cachorro: "dog",
  cao: "dog",
  caes: "dog",
  dog: "dog",
  gato: "cat",
  gatos: "cat",
  cat: "cat",
};

// Strip combining diacritics so "cão" / "cães" normalize to "cao" / "caes".
const COMBINING_MARKS = /[̀-ͯ]/g;

export function toCatalogSpecies(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const normalized = value
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .trim();
  return SPECIES_ALIASES[normalized] ?? normalized;
}

export function speciesMatches(
  catalogSpecies: string,
  patientSpecies: string | null | undefined,
): boolean {
  if (catalogSpecies === "all") return true;
  const normalized = toCatalogSpecies(patientSpecies);
  if (!normalized) return true;
  return catalogSpecies.toLowerCase() === normalized;
}
