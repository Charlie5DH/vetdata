// Flat tinted fills for icon chips, stat icons and soft badges (DESIGN.md §11). No gradients, no shadows.
// Utility classes (not component-layer CSS) so they compose with Badge/Button variants through cn().
export const themeAccentClasses = {
  primary: {
    icon: "border border-transparent bg-range text-primary",
    badge: "border-transparent bg-range text-foreground",
    stat: "border border-transparent bg-range text-primary",
  },
  chart1: {
    icon: "border border-transparent bg-muted text-primary",
    badge: "border-border bg-muted text-foreground",
    stat: "border border-transparent bg-muted text-primary",
  },
  chart2: {
    icon: "border border-transparent bg-warning-soft text-warning",
    badge: "border-transparent bg-warning-soft text-warning",
    stat: "border border-transparent bg-warning-soft text-warning",
  },
  chart3: {
    icon: "border border-transparent bg-success-soft text-success",
    badge: "border-transparent bg-success-soft text-success",
    stat: "border border-transparent bg-success-soft text-success",
  },
  chart4: {
    icon: "border border-transparent bg-lemon-100 text-lemon-600",
    badge: "border-transparent bg-lemon-100 text-foreground",
    stat: "border border-transparent bg-lemon-100 text-lemon-600",
  },
  chart5: {
    icon: "border border-transparent bg-info-soft text-info",
    badge: "border-transparent bg-info-soft text-info",
    stat: "border border-transparent bg-info-soft text-info",
  },
  neutral: {
    icon: "border border-transparent bg-muted text-muted-foreground",
    badge: "border-border bg-muted text-muted-foreground",
    stat: "border border-transparent bg-muted text-muted-foreground",
  },
  destructive: {
    icon: "border border-transparent bg-destructive-soft text-destructive",
    badge: "border-transparent bg-destructive-soft text-destructive",
    stat: "border border-transparent bg-destructive-soft text-destructive",
  },
} as const;

export type ThemeAccentName = keyof typeof themeAccentClasses;
