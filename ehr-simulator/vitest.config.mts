import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    test: {
      environment: "jsdom",
      setupFiles: ["./vitest.setup.ts"],
      globals: true,
      env: loadEnv(mode, process.cwd(), ""),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});