"use client";

import { useLayoutEffect } from "react";
import { getTheme, themeToCssVars, themeToInlineStyle } from "@/app/lib/theme";
import type { Theme } from "@/app/types";

const THEME_STYLE_ID = "app-theme-vars";

interface ThemeProviderProps {
  theme?: Theme | Record<string, unknown> | null;
  children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const resolvedTheme = getTheme(theme);
  const inlineStyle = themeToInlineStyle(resolvedTheme);

  useLayoutEffect(() => {
    const vars = themeToCssVars(resolvedTheme);
    const css = `:root { ${vars} } html, body { background-color: var(--theme-background) !important; color: var(--theme-foreground) !important; }`;
    let el = document.getElementById(THEME_STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = THEME_STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = css;
  }, [resolvedTheme.primary, resolvedTheme.background, resolvedTheme.secondary, resolvedTheme.foreground, resolvedTheme.foregroundMuted, resolvedTheme.primaryHover, resolvedTheme.secondarySoft, resolvedTheme.whatsapp]);

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={inlineStyle as React.CSSProperties}
    >
      {children}
    </div>
  );
}
