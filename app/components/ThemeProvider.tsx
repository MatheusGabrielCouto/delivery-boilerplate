"use client";

import { getTheme, themeToCssVars } from "@/app/lib/theme";
import type { Theme } from "@/app/types";

interface ThemeProviderProps {
  theme?: Theme | null;
  children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const resolvedTheme = getTheme(theme);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `:root { ${themeToCssVars(resolvedTheme)} }`,
        }}
      />
      {children}
    </>
  );
}
