"use client";

import { useLayoutEffect } from "react";
import { useTheme } from "next-themes";

function applyLightTheme() {
  const root = document.documentElement;
  root.classList.remove("dark");
  root.classList.add("light");
  root.style.colorScheme = "light";
}

export function ForceLightTheme() {
  const { setTheme } = useTheme();

  useLayoutEffect(() => {
    applyLightTheme();

    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      if (root.classList.contains("dark")) {
        applyLightTheme();
      }
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      setTheme(window.localStorage.getItem("theme") ?? "system");
    };
  }, [setTheme]);

  return null;
}
