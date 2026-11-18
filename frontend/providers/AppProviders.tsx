"use client";

import * as React from "react";
import { ThemeProvider } from "./ThemeProvider";
import { DevicesProvider } from "@/features/devices/context";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({
  children,
}: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <DevicesProvider>
        {children}
      </DevicesProvider>
    </ThemeProvider>
  );
}

export * from "./AppProviders";