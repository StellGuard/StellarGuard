import { defineConfig } from "vite";
export default defineConfig({
  root: "web",
  base: "/StellarGuard/",
  build: { outDir: "../dist-demo", emptyOutDir: true }
});
