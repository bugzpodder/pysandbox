import { defineConfig } from "tsup";

export default defineConfig((options)=>({
  entry: [
    "src/index.ts",
  ],
  dts: true,
  outDir:"dist",
  format: ["esm", "cjs"],
  name: "tsup-tutorial",
  splitting: false,
  outExtension({ format }) {
    return {
      js: `.${format}.js`,
    };
  },
  loader: {
    ".py": "text"
  },
  sourcemap: true,
  clean: true,
  target: "es2016",
  minify: !options.watch,
}));