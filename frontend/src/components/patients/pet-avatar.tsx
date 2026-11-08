import type { ComponentType } from "react";

import {
  BirdIcon,
  CatIcon,
  DogIcon,
  PawIcon,
  RabbitIcon,
  type IconProps,
} from "@/components/icons/vetdata-icons";
import { cn } from "@/lib/utils";

// Strip combining diacritics so "cão" / "pássaro" match "cao" / "passaro".
const COMBINING_MARKS = /[̀-ͯ]/g;

const SPECIES_ICONS: Record<string, ComponentType<IconProps>> = {
  cachorro: DogIcon,
  cao: DogIcon,
  caes: DogIcon,
  canino: DogIcon,
  canina: DogIcon,
  dog: DogIcon,
  canine: DogIcon,
  gato: CatIcon,
  gata: CatIcon,
  felino: CatIcon,
  felina: CatIcon,
  cat: CatIcon,
  feline: CatIcon,
  passaro: BirdIcon,
  ave: BirdIcon,
  aves: BirdIcon,
  bird: BirdIcon,
  avian: BirdIcon,
  coelho: RabbitIcon,
  rabbit: RabbitIcon,
};

function speciesKey(species?: string | null) {
  return (species ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .trim();
}

/** VetData species icon for a species name ("Cachorro", "Gato", …); paw for anything else. */
export function SpeciesIcon({
  species,
  ...props
}: IconProps & { species?: string | null }) {
  const Icon = SPECIES_ICONS[speciesKey(species)] ?? PawIcon;
  return <Icon {...props} />;
}

/** Pet avatar: species icon on a mint circle (DESIGN.md §11). */
export function PetAvatar({
  species,
  iconSize = 16,
  className,
}: {
  species?: string | null;
  iconSize?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full bg-mint-300 text-foreground",
        className,
      )}
    >
      <SpeciesIcon species={species} size={iconSize} />
    </span>
  );
}
