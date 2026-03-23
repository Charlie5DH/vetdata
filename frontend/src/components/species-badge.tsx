import { Badge } from "@/components/ui/badge";
import { Cat, Dog, Bird, Fish, Rabbit, PawPrint } from "lucide-react";
import { themeAccentClasses } from "@/lib/theme-styles";
import { cn } from "@/lib/utils";

interface SpeciesBadgeProps {
  species: string;
  className?: string;
}

export function SpeciesBadge({ species, className }: SpeciesBadgeProps) {
  const normalizedSpecies = species?.toLowerCase().trim();

  let Icon = PawPrint;
  let gradientClass: string = themeAccentClasses.neutral.badge;

  if (!species) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "gap-1.5",
          gradientClass,
          className,
        )}
      >
        <Icon className="size-3.5" />
        <span className="capitalize">Unknown</span>
      </Badge>
    );
  }

  switch (normalizedSpecies) {
    case "dog":
    case "canine":
      Icon = Dog;
      gradientClass = themeAccentClasses.chart1.badge;
      break;
    case "cat":
    case "feline":
      Icon = Cat;
      gradientClass = themeAccentClasses.chart2.badge;
      break;
    case "bird":
    case "avian":
      Icon = Bird;
      gradientClass = themeAccentClasses.chart3.badge;
      break;
    case "fish":
      Icon = Fish;
      gradientClass = themeAccentClasses.primary.badge;
      break;
    case "rabbit":
      Icon = Rabbit;
      gradientClass = themeAccentClasses.chart4.badge;
      break;
    default:
      Icon = PawPrint;
      gradientClass = themeAccentClasses.neutral.badge;
      break;
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5",
        gradientClass,
        className,
      )}
    >
      <Icon className="size-3.5" />
      <span className="capitalize">{species}</span>
    </Badge>
  );
}
