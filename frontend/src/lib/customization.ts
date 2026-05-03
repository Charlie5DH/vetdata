import {
  APP_THEME_STORAGE_KEY,
  DEFAULT_APP_THEME,
  isAppThemeId,
  type AppThemeId,
} from "@/lib/themes";

export const APP_CUSTOMIZATION_STORAGE_KEY = "vetdata.customization";

export type AppFontFamily =
  | "theme"
  | "inter"
  | "manrope"
  | "outfit"
  | "plus-jakarta"
  | "montserrat"
  | "lora"
  | "merriweather"
  | "source-serif-4"
  | "system";

export type AppComponentSize = "compact" | "comfortable" | "spacious";

export type AppControlHeight = "compact" | "comfortable" | "tall";

export type AppBorderStyle = "none" | "soft" | "default" | "strong";

export type AppShadowDepth = "none" | "soft" | "default" | "strong";

export interface AppCustomization {
  theme: AppThemeId;
  fontFamily: AppFontFamily;
  fontSize: number;
  fontWeight: number;
  badgeFontSize: number;
  badgePaddingX: number;
  badgePaddingY: number;
  badgeRadiusScale: number;
  badgeBorderStyle: AppBorderStyle;
  badgeShadowDepth: AppShadowDepth;
  componentSize: AppComponentSize;
  controlHeight: AppControlHeight;
  radiusScale: number;
  borderStyle: AppBorderStyle;
  shadowDepth: AppShadowDepth;
}

export const appFontOptions = [
  {
    id: "theme",
    label: "Fonte do tema",
    stack: "",
    description: "Usa a tipografia definida pelo tema selecionado.",
  },
  {
    id: "inter",
    label: "Inter",
    stack: 'Inter, "Inter Variable", sans-serif',
    description: "Neutra e legivel para fluxos clinicos densos.",
  },
  {
    id: "manrope",
    label: "Manrope",
    stack: "Manrope, sans-serif",
    description: "Mais editorial e compacta para dashboards modernos.",
  },
  {
    id: "outfit",
    label: "Outfit",
    stack: "Outfit, sans-serif",
    description: "Geometrica e forte para uma interface mais marcante.",
  },
  {
    id: "plus-jakarta",
    label: "Plus Jakarta Sans",
    stack: '"Plus Jakarta Sans", sans-serif',
    description: "Mais macia e contemporanea sem perder clareza.",
  },
  {
    id: "montserrat",
    label: "Montserrat",
    stack: "Montserrat, sans-serif",
    description: "Mais geometrica para uma interface mais marcada.",
  },
  {
    id: "lora",
    label: "Lora",
    stack: "Lora, serif",
    description:
      "Serifada com leitura suave para uma personalidade mais classica.",
  },
  {
    id: "merriweather",
    label: "Merriweather",
    stack: "Merriweather, serif",
    description:
      "Serifada robusta para um contraste mais forte em telas densas.",
  },
  {
    id: "source-serif-4",
    label: "Source Serif 4",
    stack: '"Source Serif 4", serif',
    description: "Serifada editorial com desenho limpo e tecnico.",
  },
  {
    id: "system",
    label: "Sistema",
    stack:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    description: "Segue a pilha nativa do sistema operacional.",
  },
] as const satisfies ReadonlyArray<{
  id: AppFontFamily;
  label: string;
  stack: string;
  description: string;
}>;

export const componentSizeOptions = [
  { id: "compact", label: "Compacto" },
  { id: "comfortable", label: "Confortavel" },
  { id: "spacious", label: "Espacoso" },
] as const satisfies ReadonlyArray<{
  id: AppComponentSize;
  label: string;
}>;

export const controlHeightOptions = [
  { id: "compact", label: "Baixa" },
  { id: "comfortable", label: "Padrao" },
  { id: "tall", label: "Alta" },
] as const satisfies ReadonlyArray<{
  id: AppControlHeight;
  label: string;
}>;

export const borderStyleOptions = [
  { id: "none", label: "Sem bordas" },
  { id: "soft", label: "Suave" },
  { id: "default", label: "Padrao" },
  { id: "strong", label: "Forte" },
] as const satisfies ReadonlyArray<{
  id: AppBorderStyle;
  label: string;
}>;

export const shadowDepthOptions = [
  { id: "none", label: "Sem sombra" },
  { id: "soft", label: "Suave" },
  { id: "default", label: "Padrao" },
  { id: "strong", label: "Marcada" },
] as const satisfies ReadonlyArray<{
  id: AppShadowDepth;
  label: string;
}>;

export const defaultAppCustomization: AppCustomization = {
  theme: DEFAULT_APP_THEME,
  fontFamily: "manrope",
  fontSize: 15,
  fontWeight: 400,
  badgeFontSize: 12,
  badgePaddingX: 10,
  badgePaddingY: 4,
  badgeRadiusScale: 100,
  badgeBorderStyle: "soft",
  badgeShadowDepth: "none",
  componentSize: "comfortable",
  controlHeight: "comfortable",
  radiusScale: 100,
  borderStyle: "default",
  shadowDepth: "default",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAppFontFamily(value: unknown): value is AppFontFamily {
  return appFontOptions.some((option) => option.id === value);
}

function isAppComponentSize(value: unknown): value is AppComponentSize {
  return componentSizeOptions.some((option) => option.id === value);
}

function isAppControlHeight(value: unknown): value is AppControlHeight {
  return controlHeightOptions.some((option) => option.id === value);
}

function isAppBorderStyle(value: unknown): value is AppBorderStyle {
  return borderStyleOptions.some((option) => option.id === value);
}

function isAppShadowDepth(value: unknown): value is AppShadowDepth {
  return shadowDepthOptions.some((option) => option.id === value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getEnumValue<T extends string>(
  value: unknown,
  guard: (candidate: unknown) => candidate is T,
  fallback: T,
) {
  return guard(value) ? value : fallback;
}

function getClampedNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
) {
  return typeof value === "number" ? clamp(value, min, max) : fallback;
}

export function sanitizeAppCustomization(value: unknown): AppCustomization {
  if (!isRecord(value)) {
    return defaultAppCustomization;
  }

  const theme =
    typeof value.theme === "string" && isAppThemeId(value.theme)
      ? value.theme
      : defaultAppCustomization.theme;
  const fontFamily = getEnumValue(
    value.fontFamily,
    isAppFontFamily,
    defaultAppCustomization.fontFamily,
  );
  const componentSize = getEnumValue(
    value.componentSize,
    isAppComponentSize,
    defaultAppCustomization.componentSize,
  );
  const controlHeight = getEnumValue(
    value.controlHeight,
    isAppControlHeight,
    defaultAppCustomization.controlHeight,
  );
  const borderStyle = getEnumValue(
    value.borderStyle,
    isAppBorderStyle,
    defaultAppCustomization.borderStyle,
  );
  const shadowDepth = getEnumValue(
    value.shadowDepth,
    isAppShadowDepth,
    defaultAppCustomization.shadowDepth,
  );
  const fontSize = getClampedNumber(
    value.fontSize,
    14,
    20,
    defaultAppCustomization.fontSize,
  );
  const fontWeight = getClampedNumber(
    value.fontWeight,
    300,
    600,
    defaultAppCustomization.fontWeight,
  );
  const badgeFontSize = getClampedNumber(
    value.badgeFontSize,
    10,
    16,
    defaultAppCustomization.badgeFontSize,
  );
  const badgePaddingX = getClampedNumber(
    value.badgePaddingX,
    4,
    16,
    defaultAppCustomization.badgePaddingX,
  );
  const badgePaddingY = getClampedNumber(
    value.badgePaddingY,
    0,
    8,
    defaultAppCustomization.badgePaddingY,
  );
  const badgeRadiusScale = getClampedNumber(
    value.badgeRadiusScale,
    60,
    180,
    defaultAppCustomization.badgeRadiusScale,
  );
  const badgeBorderStyle = getEnumValue(
    value.badgeBorderStyle,
    isAppBorderStyle,
    defaultAppCustomization.badgeBorderStyle,
  );
  const badgeShadowDepth = getEnumValue(
    value.badgeShadowDepth,
    isAppShadowDepth,
    defaultAppCustomization.badgeShadowDepth,
  );
  const radiusScale = getClampedNumber(
    value.radiusScale,
    60,
    180,
    defaultAppCustomization.radiusScale,
  );

  return {
    theme,
    fontFamily,
    fontSize,
    fontWeight,
    badgeFontSize,
    badgePaddingX,
    badgePaddingY,
    badgeRadiusScale,
    badgeBorderStyle,
    badgeShadowDepth,
    componentSize,
    controlHeight,
    radiusScale,
    borderStyle,
    shadowDepth,
  };
}

export function getStoredAppCustomization(): AppCustomization {
  if (globalThis.window === undefined) {
    return defaultAppCustomization;
  }

  const storedCustomization = globalThis.window.localStorage.getItem(
    APP_CUSTOMIZATION_STORAGE_KEY,
  );

  if (storedCustomization) {
    try {
      return sanitizeAppCustomization(JSON.parse(storedCustomization));
    } catch {
      globalThis.window.localStorage.removeItem(APP_CUSTOMIZATION_STORAGE_KEY);
    }
  }

  const storedTheme = globalThis.window.localStorage.getItem(
    APP_THEME_STORAGE_KEY,
  );

  if (storedTheme && isAppThemeId(storedTheme)) {
    return {
      ...defaultAppCustomization,
      theme: storedTheme,
    };
  }

  return defaultAppCustomization;
}
