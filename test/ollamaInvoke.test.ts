import { Ollama } from "@langchain/ollama";
import { expect, test } from "vitest";

// process.env を .env.test から読み込む
import process from "node:process";
import { config } from "dotenv";
config({ path: ".env.test" });

test("ollama invoke", async () => {
  const llm = new Ollama({
    baseUrl: process.env.OLLAMA_BASE_URL,
    model: process.env.OLLAMA_CHAT_MODEL,
    temperature: 0.0,
  });

  const answer = await llm.invoke(`why is the sky blue?`);

  expect(answer.length).toBeTruthy();
});
