// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";
import AstroPWA from "@vite-pwa/astro";

// https://astro.build/config
export default defineConfig({
  site: "https://carincon93.github.io",
  base: "gym-app",
  integrations: [
    react(),
    AstroPWA({
      mode: "development",
      base: "/gym-app/",
      scope: "/gym-app/",
      includeAssets: ["favicon.svg"],
      registerType: "autoUpdate",
      manifest: {
        name: "Astro PWA",
        short_name: "Astro PWA",
        theme_color: "#ffffff",
        icons: [],
      },
      workbox: {
        navigateFallback: "/gym-app/index.html",
        globPatterns: ["**/*.{css,js,html,svg,riv,png,webp,ico,txt}"],
      },
      devOptions: {
        enabled: true,
        navigateFallbackAllowlist: [/^\/$/],
      },
      experimental: {
        directoryAndTrailingSlashHandler: true,
      },
    }),
  ],

  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],
  },
});
