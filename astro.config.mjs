import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://crosbreaker.dev",
  output: "static",
  build: {
    inlineStylesheets: "auto"
  },
  integrations: [sitemap()]
});
