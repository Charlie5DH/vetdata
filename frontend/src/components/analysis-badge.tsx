import { Badge } from "@/components/ui/badge";
import { themeAccentClasses } from "@/lib/theme-styles";
import { cn } from "@/lib/utils";

interface AnalysisBadgeProps {
  name: string;
  className?: string;
}

export function AnalysisBadge({ name, className }: AnalysisBadgeProps) {
  const label = name || "Unknown";
  const normalized = label.toLowerCase();

  const palette = getPalette(normalized);

  return (
    <Badge
      variant="outline"
      className={cn(
        "leading-none",
        palette,
        className,
      )}
    >
      {label}
    </Badge>
  );
}

function getPalette(normalized: string) {
  if (
    normalized.includes("blood") ||
    normalized.includes("lab") ||
    normalized.includes("cbc")
  ) {
    return themeAccentClasses.chart4.badge;
  }

  if (normalized.includes("urine") || normalized.includes("urinalysis")) {
    return themeAccentClasses.chart2.badge;
  }

  if (
    normalized.includes("imaging") ||
    normalized.includes("x-ray") ||
    normalized.includes("radiograph") ||
    normalized.includes("ultrasound") ||
    normalized.includes("ct") ||
    normalized.includes("mri")
  ) {
    return themeAccentClasses.chart1.badge;
  }

  if (
    normalized.includes("cardio") ||
    normalized.includes("ekg") ||
    normalized.includes("ecg")
  ) {
    return themeAccentClasses.primary.badge;
  }

  if (normalized.includes("neuro")) {
    return themeAccentClasses.chart5.badge;
  }

  if (
    normalized.includes("follow") ||
    normalized.includes("check") ||
    normalized.includes("review")
  ) {
    return themeAccentClasses.neutral.badge;
  }

  return themeAccentClasses.chart3.badge;
}
