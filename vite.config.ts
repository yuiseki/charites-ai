/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/charites-ai/",
  test: {
    testTimeout: 10 * 60 * 1000, // 10 minutes
  },
});
