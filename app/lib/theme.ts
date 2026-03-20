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

export function getTheme(theme?: Theme | null): Theme {
  if (!theme) return DEFAULT_THEME;
  return { ...DEFAULT_THEME, ...theme };
}

export function themeToCssVars(theme: Theme): string {
  return `
    --theme-primary: ${theme.primary};
    --theme-primary-hover: ${theme.primaryHover};
    --theme-secondary: ${theme.secondary};
    --theme-secondary-soft: ${theme.secondarySoft};
    --theme-background: ${theme.background};
    --theme-foreground: ${theme.foreground};
    --theme-foreground-muted: ${theme.foregroundMuted};
    --theme-whatsapp: ${theme.whatsapp};
  `;
}
