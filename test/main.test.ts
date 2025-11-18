import { test } from "vitest";
import {
  initializeCharitesAiChain,
  invokeCharitesAiChain,
} from "../scripts/instruct";

test("", async () => {
  const chain = await initializeCharitesAiChain();

  await invokeCharitesAiChain(chain, "国の名前を黄色にして");
});
