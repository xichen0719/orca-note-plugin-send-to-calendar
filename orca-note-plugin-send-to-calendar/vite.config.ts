import react from "@vitejs/plugin-react-swc"
import externalGlobals from "rollup-plugin-external-globals"
import { defineConfig } from "vite"

export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    minify: false,
    lib: {
      entry: "src/main.ts",
      fileName: "index",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "valtio"],
    },
  },
  plugins: [react(), externalGlobals({ react: "React", valtio: "Valtio" })],
})
