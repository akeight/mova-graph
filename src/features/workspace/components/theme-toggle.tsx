"use client";

import { useSyncExternalStore } from "react";

import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";

const emptySubscribe = () => () => {};

function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();

  const isDark = hydrated && resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex w-full items-center gap-2 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
    >
      {isDark ? (
        <SunIcon className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <MoonIcon className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      <span>{isDark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
