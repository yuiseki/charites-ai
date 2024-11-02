import { OllamaEmbeddings } from "@langchain/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import type { Document } from "@langchain/core/documents";
import { expect, test } from "vitest";

// process.env を .env.test から読み込む
import process from "node:process";
import { config } from "dotenv";
config({ path: ".env.test" });

test("ollama embedding", async () => {
  const embeddings = new OllamaEmbeddings({
    baseUrl: process.env.OLLAMA_BASE_URL,
    model: process.env.OLLAMA_EMBED_MODEL,
  });

  const vectorStore = new MemoryVectorStore(embeddings);

  const document1: Document = {
    pageContent: "The powerhouse of the cell is the mitochondria",
    metadata: { source: "https://example.com" },
  };

  const document2: Document = {
    pageContent: "Buildings are made out of brick",
    metadata: { source: "https://example.com" },
  };

  const document3: Document = {
    pageContent: "Mitochondria are made out of lipids",
    metadata: { source: "https://example.com" },
  };

  const documents = [document1, document2, document3];

  await vectorStore.addDocuments(documents);

  const similaritySearchResults = await vectorStore.similaritySearch(
    "biology",
    1
  );

  expect(similaritySearchResults[0].pageContent).toBe(
    "The powerhouse of the cell is the mitochondria"
  );
});
