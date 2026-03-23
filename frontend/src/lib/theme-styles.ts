export const themeAccentClasses = {
  primary: {
    icon: "theme-icon-surface theme-icon-surface--primary",
    badge: "theme-badge-surface theme-badge-surface--primary",
    stat: "theme-icon-surface theme-icon-surface--primary",
  },
  chart1: {
    icon: "theme-icon-surface theme-icon-surface--chart1",
    badge: "theme-badge-surface theme-badge-surface--chart1",
    stat: "theme-icon-surface theme-icon-surface--chart1",
  },
  chart2: {
    icon: "theme-icon-surface theme-icon-surface--chart2",
    badge: "theme-badge-surface theme-badge-surface--chart2",
    stat: "theme-icon-surface theme-icon-surface--chart2",
  },
  chart3: {
    icon: "theme-icon-surface theme-icon-surface--chart3",
    badge: "theme-badge-surface theme-badge-surface--chart3",
    stat: "theme-icon-surface theme-icon-surface--chart3",
  },
  chart4: {
    icon: "theme-icon-surface theme-icon-surface--chart4",
    badge: "theme-badge-surface theme-badge-surface--chart4",
    stat: "theme-icon-surface theme-icon-surface--chart4",
  },
  chart5: {
    icon: "theme-icon-surface theme-icon-surface--chart5",
    badge: "theme-badge-surface theme-badge-surface--chart5",
    stat: "theme-icon-surface theme-icon-surface--chart5",
  },
  neutral: {
    icon: "theme-icon-surface theme-icon-surface--neutral",
    badge: "theme-badge-surface theme-badge-surface--neutral",
    stat: "theme-icon-surface theme-icon-surface--neutral",
  },
  destructive: {
    icon: "theme-icon-surface theme-icon-surface--destructive",
    badge: "theme-badge-surface theme-badge-surface--destructive",
    stat: "theme-icon-surface theme-icon-surface--destructive",
  },
} as const;

export type ThemeAccentName = keyof typeof themeAccentClasses;
