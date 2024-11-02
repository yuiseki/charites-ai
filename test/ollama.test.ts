import { Ollama } from "@langchain/ollama";
import { expect, test } from "vitest";

test("ollama invoke", async () => {
  const llm = new Ollama({
    baseUrl: "http://localhost:11434",
    model: "gemma2:9b",
    temperature: 0.0,
  });

  const answer = await llm.invoke(`why is the sky blue?`);

  console.log(answer);
  expect(answer.length).toBeTruthy();
});
