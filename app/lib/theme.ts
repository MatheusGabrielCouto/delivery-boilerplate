import type { Theme } from "@/app/types";

const DEFAULT_THEME: Theme = {
  primary: "#E53935",
  primaryHover: "#C62828",
  secondary: "#FFC107",
  secondarySoft: "#FFF8E1",
  background: "#FFFFFF",
  foreground: "#212121",
  foregroundMuted: "#616161",
  whatsapp: "#25D366",
};

type ThemeInput = Record<string, unknown> | Theme | null | undefined;

function normalizeThemeKeys(raw: ThemeInput): Partial<Theme> {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    primary: (o.primary ?? o.Primary) as string | undefined,
    primaryHover: (o.primaryHover ?? o.primary_hover ?? o.PrimaryHover) as string | undefined,
    secondary: (o.secondary ?? o.Secondary) as string | undefined,
    secondarySoft: (o.secondarySoft ?? o.secondary_soft ?? o.SecondarySoft) as string | undefined,
    background: (o.background ?? o.Background) as string | undefined,
    foreground: (o.foreground ?? o.Foreground) as string | undefined,
    foregroundMuted: (o.foregroundMuted ?? o.foreground_muted ?? o.ForegroundMuted) as string | undefined,
    whatsapp: (o.whatsapp ?? o.Whatsapp) as string | undefined,
  };
}

export function getTheme(theme?: ThemeInput): Theme {
  if (!theme) return { ...DEFAULT_THEME };
  const normalized = normalizeThemeKeys(theme);
  const merged = { ...DEFAULT_THEME };
  for (const [k, v] of Object.entries(normalized)) {
    if (v != null && String(v).trim()) (merged as Record<string, string>)[k] = String(v).trim();
  }
  return merged;
}

export function themeToCssVars(theme: Theme): string {
  return `--theme-primary: ${theme.primary}; --theme-primary-hover: ${theme.primaryHover}; --theme-secondary: ${theme.secondary}; --theme-secondary-soft: ${theme.secondarySoft}; --theme-background: ${theme.background}; --theme-foreground: ${theme.foreground}; --theme-foreground-muted: ${theme.foregroundMuted}; --theme-whatsapp: ${theme.whatsapp};`;
}

export function themeToInlineStyle(theme: Theme): Record<string, string> {
  return {
    "--theme-primary": theme.primary,
    "--theme-primary-hover": theme.primaryHover,
    "--theme-secondary": theme.secondary,
    "--theme-secondary-soft": theme.secondarySoft,
    "--theme-background": theme.background,
    "--theme-foreground": theme.foreground,
    "--theme-foreground-muted": theme.foregroundMuted,
    "--theme-whatsapp": theme.whatsapp,
    backgroundColor: theme.background,
    color: theme.foreground,
  };
}
