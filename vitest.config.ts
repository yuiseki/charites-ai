import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

export default defineConfig({
  test: {
    testTimeout: 10 * 60 * 1000, // 10 minutes,
    env: dotenv.config({ path: ".env.test" }).parsed,
  },
});
