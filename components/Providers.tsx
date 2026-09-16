"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useThemeStore } from "@/store/useThemeStore";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const darkMode = useThemeStore((s) => s.darkMode);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
