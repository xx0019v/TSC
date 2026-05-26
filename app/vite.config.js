import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Relative base + single-file build so the result runs from file:// (double-click)
// and also deploys cleanly under a subpath (e.g. GitHub Pages /TSC/).
export default defineConfig({
  base: "./",
  plugins: [react(), viteSingleFile()],
});
