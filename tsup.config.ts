import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  outDir: "dist",
  target: "node18",
  minify: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  shims: true,
});
