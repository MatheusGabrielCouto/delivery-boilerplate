"use client";

import { HydrationBoundary } from "@tanstack/react-query";

interface MenuHydratorProps {
  state: import("@tanstack/react-query").DehydratedState;
  children: React.ReactNode;
}

export function MenuHydrator({ state, children }: MenuHydratorProps) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}
