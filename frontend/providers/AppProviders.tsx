"use client";

import * as React from "react";
import { ThemeProvider } from "./ThemeProvider";

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
      {children}
    </ThemeProvider>
  );
}

export * from "./AppProviders";