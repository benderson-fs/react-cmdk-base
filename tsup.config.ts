import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "@base-ui/react"],
  target: "es2020",
  env: { NODE_ENV: "production" },
  esbuildOptions(options) {
    options.minifySyntax = true;
  },
});
