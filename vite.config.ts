import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/charites-ai/",
  server: {
    cors: true,
  },
  preview: {
    cors: true,
  },
});
