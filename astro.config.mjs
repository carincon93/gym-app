// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://carincon93.github.io",
  base: "gym-app",
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },
});
