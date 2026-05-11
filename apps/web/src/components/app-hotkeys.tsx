"use client";

import { useHotkeys } from "@tanstack/react-hotkeys";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

import { APP_ROUTES, HOTKEYS } from "@/lib/consts";

export function AppHotkeys() {
  const router = useRouter();
  const { resolvedTheme, setTheme, theme } = useTheme();
  const currentTheme = resolvedTheme ?? theme;

  useHotkeys(
    [
      {
        hotkey: HOTKEYS.home,
        callback: () => router.push(APP_ROUTES.home),
      },
      {
        hotkey: HOTKEYS.repositories,
        callback: () => router.push(APP_ROUTES.repositories),
      },
      {
        hotkey: HOTKEYS.donors,
        callback: () => router.push(APP_ROUTES.donors),
      },
      {
        hotkey: HOTKEYS.theme,
        callback: () => setTheme(currentTheme === "dark" ? "light" : "dark"),
      },
      {
        hotkey: HOTKEYS.requestReview,
        callback: () => router.push(APP_ROUTES.requestReview),
      },
      {
        hotkey: HOTKEYS.donateReview,
        callback: () => router.push(APP_ROUTES.donateReview),
      },
    ],
    { preventDefault: true },
  );

  return null;
}
