"use client";

import { Toaster } from "@opensec/ui/components/sonner";
import { ThemeProvider } from "@opensec/ui/components/theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { queryClient } from "@/utils/orpc";

import { AppHotkeys } from "./app-hotkeys";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <AppHotkeys />
        {children}
        <ReactQueryDevtools />
      </QueryClientProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
