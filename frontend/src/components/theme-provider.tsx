/* eslint-disable react-refresh/only-export-components */

import * as React from "react";

import {
  APP_CUSTOMIZATION_STORAGE_KEY,
  appFontOptions,
  defaultAppCustomization,
  getStoredAppCustomization,
  type AppBorderStyle,
  type AppComponentSize,
  type AppControlHeight,
  type AppCustomization,
  type AppShadowDepth,
} from "@/lib/customization";
import { appThemes, type AppThemeId, getAppTheme } from "@/lib/themes";

type ThemeContextValue = {
  customization: AppCustomization;
  fonts: typeof appFontOptions;
  theme: AppThemeId;
  setTheme: (theme: AppThemeId) => void;
  updateCustomization: (updates: Partial<AppCustomization>) => void;
  resetCustomization: () => void;
  themes: typeof appThemes;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const DEFAULT_THEME_RADIUS = "0.5rem";
const DEFAULT_FONT_STACK = 'Inter, "Inter Variable", sans-serif';

const componentSizeVars: Record<AppComponentSize, Record<string, string>> = {
  compact: {
    "--app-control-gap": "0.375rem",
    "--app-control-gap-sm": "0.25rem",
    "--app-control-gap-xs": "0.25rem",
    "--app-control-px": "0.75rem",
    "--app-control-px-sm": "0.625rem",
    "--app-control-px-xs": "0.5rem",
    "--app-card-gap": "1rem",
    "--app-card-padding": "1rem",
    "--app-card-padding-sm": "0.75rem",
    "--app-table-cell-px": "0.625rem",
    "--app-table-cell-py": "0.5rem",
    "--app-table-head-height": "2.5rem",
  },
  comfortable: {
    "--app-control-gap": "0.5rem",
    "--app-control-gap-sm": "0.375rem",
    "--app-control-gap-xs": "0.25rem",
    "--app-control-px": "1rem",
    "--app-control-px-sm": "0.75rem",
    "--app-control-px-xs": "0.625rem",
    "--app-card-gap": "1.5rem",
    "--app-card-padding": "1.5rem",
    "--app-card-padding-sm": "1rem",
    "--app-table-cell-px": "0.75rem",
    "--app-table-cell-py": "0.75rem",
    "--app-table-head-height": "3rem",
  },
  spacious: {
    "--app-control-gap": "0.625rem",
    "--app-control-gap-sm": "0.5rem",
    "--app-control-gap-xs": "0.375rem",
    "--app-control-px": "1.125rem",
    "--app-control-px-sm": "0.875rem",
    "--app-control-px-xs": "0.75rem",
    "--app-card-gap": "1.75rem",
    "--app-card-padding": "1.75rem",
    "--app-card-padding-sm": "1.25rem",
    "--app-table-cell-px": "0.875rem",
    "--app-table-cell-py": "0.875rem",
    "--app-table-head-height": "3.25rem",
  },
};

const controlHeightVars: Record<AppControlHeight, Record<string, string>> = {
  compact: {
    "--app-control-height": "2.5rem",
    "--app-control-height-sm": "2rem",
    "--app-control-height-xs": "1.75rem",
    "--app-control-height-lg": "2.875rem",
    "--app-control-icon-size": "2.5rem",
    "--app-control-icon-size-sm": "2rem",
    "--app-control-icon-size-xs": "1.5rem",
    "--app-control-icon-size-lg": "2.875rem",
    "--app-switch-width": "1.75rem",
    "--app-switch-height": "1rem",
    "--app-switch-thumb-size": "0.75rem",
    "--app-switch-width-sm": "1.5rem",
    "--app-switch-height-sm": "0.875rem",
    "--app-switch-thumb-size-sm": "0.625rem",
    "--app-switch-translate-x":
      "calc(var(--app-switch-width) - var(--app-switch-thumb-size) - 2px)",
    "--app-switch-translate-x-sm":
      "calc(var(--app-switch-width-sm) - var(--app-switch-thumb-size-sm) - 2px)",
  },
  comfortable: {
    "--app-control-height": "3rem",
    "--app-control-height-sm": "2.5rem",
    "--app-control-height-xs": "2rem",
    "--app-control-height-lg": "3.25rem",
    "--app-control-icon-size": "3rem",
    "--app-control-icon-size-sm": "2rem",
    "--app-control-icon-size-xs": "1.5rem",
    "--app-control-icon-size-lg": "3.25rem",
    "--app-switch-width": "2rem",
    "--app-switch-height": "1.125rem",
    "--app-switch-thumb-size": "0.875rem",
    "--app-switch-width-sm": "1.75rem",
    "--app-switch-height-sm": "1rem",
    "--app-switch-thumb-size-sm": "0.75rem",
    "--app-switch-translate-x":
      "calc(var(--app-switch-width) - var(--app-switch-thumb-size) - 2px)",
    "--app-switch-translate-x-sm":
      "calc(var(--app-switch-width-sm) - var(--app-switch-thumb-size-sm) - 2px)",
  },
  tall: {
    "--app-control-height": "3.5rem",
    "--app-control-height-sm": "3rem",
    "--app-control-height-xs": "2.25rem",
    "--app-control-height-lg": "3.75rem",
    "--app-control-icon-size": "3.5rem",
    "--app-control-icon-size-sm": "2.5rem",
    "--app-control-icon-size-xs": "1.75rem",
    "--app-control-icon-size-lg": "3.75rem",
    "--app-switch-width": "2.25rem",
    "--app-switch-height": "1.25rem",
    "--app-switch-thumb-size": "1rem",
    "--app-switch-width-sm": "2rem",
    "--app-switch-height-sm": "1.125rem",
    "--app-switch-thumb-size-sm": "0.875rem",
    "--app-switch-translate-x":
      "calc(var(--app-switch-width) - var(--app-switch-thumb-size) - 2px)",
    "--app-switch-translate-x-sm":
      "calc(var(--app-switch-width-sm) - var(--app-switch-thumb-size-sm) - 2px)",
  },
};

const softShadowVars = {
  "theme-shadow-2xs": "0 1px 2px 0 hsl(0 0% 0% / 0.03)",
  "theme-shadow-xs": "0 1px 2px 0 hsl(0 0% 0% / 0.04)",
  "theme-shadow-sm":
    "0 1px 2px 0 hsl(0 0% 0% / 0.05), 0 1px 2px -1px hsl(0 0% 0% / 0.05)",
  "theme-shadow":
    "0 1px 2px 0 hsl(0 0% 0% / 0.05), 0 1px 2px -1px hsl(0 0% 0% / 0.05)",
  "theme-shadow-md":
    "0 2px 4px -1px hsl(0 0% 0% / 0.06), 0 2px 3px -2px hsl(0 0% 0% / 0.06)",
  "theme-shadow-lg": "0 6px 12px -6px hsl(0 0% 0% / 0.08)",
  "theme-shadow-xl": "0 12px 24px -12px hsl(0 0% 0% / 0.10)",
  "theme-shadow-2xl": "0 18px 28px -18px hsl(0 0% 0% / 0.12)",
} as const;

const strongShadowVars = {
  "theme-shadow-2xs": "0 2px 4px 0 hsl(0 0% 0% / 0.08)",
  "theme-shadow-xs": "0 2px 4px 0 hsl(0 0% 0% / 0.10)",
  "theme-shadow-sm":
    "0 4px 10px -4px hsl(0 0% 0% / 0.14), 0 2px 4px -2px hsl(0 0% 0% / 0.12)",
  "theme-shadow":
    "0 4px 12px -4px hsl(0 0% 0% / 0.16), 0 2px 6px -2px hsl(0 0% 0% / 0.12)",
  "theme-shadow-md":
    "0 10px 20px -8px hsl(0 0% 0% / 0.18), 0 4px 8px -4px hsl(0 0% 0% / 0.14)",
  "theme-shadow-lg": "0 16px 28px -12px hsl(0 0% 0% / 0.20)",
  "theme-shadow-xl": "0 24px 40px -18px hsl(0 0% 0% / 0.24)",
  "theme-shadow-2xl": "0 32px 56px -22px hsl(0 0% 0% / 0.28)",
} as const;

function setVariables(root: HTMLElement, variables: Record<string, string>) {
  for (const [key, value] of Object.entries(variables)) {
    root.style.setProperty(key.startsWith("--") ? key : `--${key}`, value);
  }
}

function getBorderColor(
  border: string,
  foreground: string,
  borderStyle: AppBorderStyle,
) {
  switch (borderStyle) {
    case "none":
      return "transparent";
    case "soft":
      return `color-mix(in oklch, ${border} 60%, transparent)`;
    case "strong":
      return `color-mix(in oklch, ${border} 70%, ${foreground} 30%)`;
    default:
      return border;
  }
}

function applyShadowDepth(root: HTMLElement, shadowDepth: AppShadowDepth) {
  if (shadowDepth === "default") {
    return;
  }

  if (shadowDepth === "none") {
    setVariables(root, {
      "theme-shadow-2xs": "none",
      "theme-shadow-xs": "none",
      "theme-shadow-sm": "none",
      "theme-shadow": "none",
      "theme-shadow-md": "none",
      "theme-shadow-lg": "none",
      "theme-shadow-xl": "none",
      "theme-shadow-2xl": "none",
    });
    return;
  }

  setVariables(
    root,
    shadowDepth === "soft" ? softShadowVars : strongShadowVars,
  );
}

function getBadgeShadow(shadowDepth: AppShadowDepth) {
  switch (shadowDepth) {
    case "none":
      return "none";
    case "soft":
      return "var(--theme-shadow-2xs)";
    case "strong":
      return "var(--theme-shadow-sm)";
    default:
      return "var(--theme-shadow-xs)";
  }
}

function getBadgeBorderWidth(borderStyle: AppBorderStyle) {
  switch (borderStyle) {
    case "none":
      return "0px";
    case "strong":
      return "2px";
    default:
      return "1px";
  }
}

function applyTheme(themeId: AppThemeId, customization: AppCustomization) {
  const root = document.documentElement;
  const theme = getAppTheme(themeId);
  let borderWidth = "1px";

  if (customization.borderStyle === "none") {
    borderWidth = "0px";
  } else if (customization.borderStyle === "strong") {
    borderWidth = "2px";
  }

  root.dataset.theme = theme.id;
  root.style.colorScheme = theme.appearance;
  root.classList.toggle("dark", theme.appearance === "dark");

  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(`--${key}`, value);
  }

  const themeFont = theme.vars["theme-font-sans"] ?? DEFAULT_FONT_STACK;
  const fontOverride = appFontOptions.find(
    (option) => option.id === customization.fontFamily,
  );
  const baseBorder = theme.vars.border ?? "oklch(0.922 0 0)";
  const baseForeground = theme.vars.foreground ?? "oklch(0.145 0 0)";
  const baseInput = theme.vars.input ?? baseBorder;
  const baseSidebarBorder = theme.vars["sidebar-border"] ?? baseBorder;

  root.style.setProperty(
    "--app-theme-radius",
    theme.vars.radius ?? DEFAULT_THEME_RADIUS,
  );
  root.style.setProperty(
    "--radius",
    `calc(var(--app-theme-radius) * ${customization.radiusScale / 100})`,
  );
  root.style.setProperty("--theme-font-sans", fontOverride?.stack || themeFont);
  root.style.setProperty("--app-font-size-root", `${customization.fontSize}px`);
  root.style.setProperty(
    "--app-font-weight-base",
    `${customization.fontWeight}`,
  );
  root.style.setProperty(
    "--app-badge-font-size",
    `${customization.badgeFontSize / 16}rem`,
  );
  root.style.setProperty(
    "--app-badge-padding-x",
    `${customization.badgePaddingX / 16}rem`,
  );
  root.style.setProperty(
    "--app-badge-padding-y",
    `${customization.badgePaddingY / 16}rem`,
  );
  root.style.setProperty(
    "--app-badge-radius",
    `calc(var(--radius) * ${customization.badgeRadiusScale / 100})`,
  );
  root.style.setProperty(
    "--app-badge-border-width",
    getBadgeBorderWidth(customization.badgeBorderStyle),
  );
  root.style.setProperty(
    "--app-badge-shadow",
    getBadgeShadow(customization.badgeShadowDepth),
  );
  root.style.setProperty("--app-border-width", borderWidth);

  setVariables(root, componentSizeVars[customization.componentSize]);
  setVariables(root, controlHeightVars[customization.controlHeight]);

  root.style.setProperty(
    "--border",
    getBorderColor(baseBorder, baseForeground, customization.borderStyle),
  );
  root.style.setProperty(
    "--input",
    getBorderColor(baseInput, baseForeground, customization.borderStyle),
  );
  root.style.setProperty(
    "--sidebar-border",
    getBorderColor(
      baseSidebarBorder,
      baseForeground,
      customization.borderStyle,
    ),
  );

  applyShadowDepth(root, customization.shadowDepth);
}

export function initializeAppTheme() {
  if (globalThis.window === undefined) {
    return;
  }

  const customization = getStoredAppCustomization();
  applyTheme(customization.theme, customization);
}

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const [customization, setCustomization] = React.useState<AppCustomization>(
    () => getStoredAppCustomization(),
  );

  React.useLayoutEffect(() => {
    applyTheme(customization.theme, customization);
    globalThis.window.localStorage.setItem(
      APP_CUSTOMIZATION_STORAGE_KEY,
      JSON.stringify(customization),
    );
  }, [customization]);

  const updateCustomization = React.useCallback(
    (updates: Partial<AppCustomization>) => {
      setCustomization((currentCustomization) => ({
        ...currentCustomization,
        ...updates,
      }));
    },
    [],
  );

  const setTheme = React.useCallback((theme: AppThemeId) => {
    setCustomization((currentCustomization) => ({
      ...currentCustomization,
      theme,
    }));
  }, []);

  const resetCustomization = React.useCallback(() => {
    globalThis.window.localStorage.removeItem(APP_CUSTOMIZATION_STORAGE_KEY);
    setCustomization(defaultAppCustomization);
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      customization,
      fonts: appFontOptions,
      theme: customization.theme,
      setTheme,
      updateCustomization,
      resetCustomization,
      themes: appThemes,
    }),
    [customization, resetCustomization, setTheme, updateCustomization],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider.");
  }

  return context;
}

export function useAppCustomization() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppCustomization must be used within a ThemeProvider.");
  }

  return context;
}
