import { Ollama } from "@langchain/ollama";
import { expect, test } from "vitest";

test("ollama invoke", async () => {
  const llm = new Ollama({
    baseUrl: "http://localhost:11434",
    model: "gemma2:2b",
    temperature: 0.0,
  });

  const answer = await llm.invoke(`why is the sky blue?`);

  expect(answer.length).toBeTruthy();
});
