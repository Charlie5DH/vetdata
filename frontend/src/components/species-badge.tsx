import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import {
  BirdIcon,
  CatIcon,
  DogIcon,
  PawIcon,
  RabbitIcon,
  type IconProps,
} from "@/components/icons/vetdata-icons";
import { toCatalogSpecies } from "@/lib/species";
import { cn } from "@/lib/utils";

interface SpeciesBadgeProps {
  species: string;
  className?: string;
}

// Species are stored in Portuguese ("Cachorro", "Gato"); toCatalogSpecies maps dog/cat aliases.
const SPECIES_ICONS: Record<string, ComponentType<IconProps>> = {
  dog: DogIcon,
  canine: DogIcon,
  cat: CatIcon,
  feline: CatIcon,
  bird: BirdIcon,
  avian: BirdIcon,
  ave: BirdIcon,
  aves: BirdIcon,
  passaro: BirdIcon,
  rabbit: RabbitIcon,
  coelho: RabbitIcon,
};

export function SpeciesBadge({ species, className }: SpeciesBadgeProps) {
  const Icon = SPECIES_ICONS[toCatalogSpecies(species) ?? ""] ?? PawIcon;

  return (
    <Badge variant="secondary" className={cn(className)}>
      <Icon size={12} className="text-stone-600" />
      <span className="capitalize">{species || "Unknown"}</span>
    </Badge>
  );
}
