"use client";

import { ThemeProvider } from "@/app/components/ThemeProvider";
import { ImagePreloader } from "@/app/components/ImagePreloader";
import { useMenu } from "@/app/hooks/useMenu";

function pickTheme(menu: Record<string, unknown> | null | undefined) {
  return (
    (menu?.theme as Record<string, unknown>) ??
    (menu?.data as Record<string, unknown>)?.theme ??
    (menu?.restaurant as Record<string, unknown>)?.theme ??
    null
  );
}

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const { data: menu } = useMenu();
  const theme = menu ? pickTheme(menu as unknown as Record<string, unknown>) : null;

  return (
    <ThemeProvider theme={theme}>
      <ImagePreloader
        products={menu?.products ?? []}
        restaurantIcon={menu?.restaurant?.logo ?? menu?.restaurant?.icon}
      >
        {children}
      </ImagePreloader>
    </ThemeProvider>
  );
}
