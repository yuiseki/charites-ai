// await invokeCharitesAiChain("地図の背景を薄い灰色にしてください")
// await invokeCharitesAiChain("地図に海を表示してください")
// await invokeCharitesAiChain("地図に国の名前を表示してください")
// のような感じで地図のスタイル定義を次々と実行するAI Agentを作成する

import { PromptTemplate } from "langchain/prompts";
// ts-nodeでembed.tsからinvokeCharitesAiChainをimportするには.tsが必要！
import { initializeCharitesAiChain, invokeCharitesAiChain } from "./embed.ts";
import { OpenAIChat } from "langchain/llms/openai";

const baseInstructions = `
1. Set the background color of the map to light sand gray.
2. Display the sea on the map.
3. Show parks and green areas on the map in a light green color.
4. Show the hospitals on the map in a light red color.
5. Show the schools on the map in a light light purple color.
6. Display railway lines on the map in a dark blue color.
7. Display highways on the map in light yellow and opacity 50%.
`;

// 地図スタイルの指示を生成AIに出力させるプロンプト
// ステップバイステップで地図スタイルを作り上げる計画を立てるように指示を出す
// 人間が見れる一般的な地図のスタイルを作ることを目標とする
// 上限を決める
const limitOfInstructions = 15;
const charitesAiAgentPromptTemplate = PromptTemplate.fromTemplate(
  `You are a expert of OpenStreetMap and map scheme of openmaptiles.
Your goal is to create a map style, which is simple but meaningful and helpful for humanity.
You can create a map style by giving instructions to the map style creation AI.
So, you will give step by step instructions to the map style creation AI.
Then, Another AI will create a map style according to your instructions.

Your instructions must be simple and easy to understand for the map style creation AI.
NOTE: map style creation AI can not compare or adjust the color of the each instruction, so you should specify the color by name or rgb hex code.
NOTE: Do not split the instructions for the same object into multiple instructions.
NOTE: Do not use 'and' in the instructions. Each instructions must be specify one object. Keep it simple and step by step.
Your instructions must not be includes unnecessary steps to create a map style, compass, scale, legend, etc.
Your instructions should be includes correct and useful steps to create a map style, based on your knowledge and experience.

IMPORTANT: You can only give up to ${limitOfInstructions} instructions to the map style creation AI.

Note: You no need to draw rivers and lakes. Because, rivers and lakes are drawn same as the sea.
Note: The order of the instructions is important. The instructions output first will be drawn below. So, you should output the instructions in the order you want them to be drawn.
Note: Names of countries should be output the last. Because, the names of countries are drawn on top of the map.

Most important is, You must give instructions about the following objects in the last step of your instructions:
- boundary of states, provinces, prefectures, etc. It is admin_level=4 in OpenStreetMap.
- boundary of countries. It is admin_level=2 in OpenStreetMap.
- name of cities, towns, villages, etc.
- name of states, provinces, prefectures, etc.
- name of countries

Note: Number of instructions is limited, so you must output only most important instructions.
Note: Again, The order of the instructions is important. The instructions output first will be drawn below. So, you should output the instructions in the order you want them to be drawn.
Note: So, you should not output the instructions about buildings and roads at the end.

Your Instructions:
${baseInstructions}
`
);

const chain = await initializeCharitesAiChain();

const llm = new OpenAIChat({ temperature: 0 });
const prompt = await charitesAiAgentPromptTemplate.format({});
const result = await llm.invoke(prompt);
const convertedResult = `${baseInstructions}${result}`;

console.info(convertedResult);
console.info("");

const instructions = convertedResult
  .split("\n")
  .filter((line) => line.length > 0);
for (const instruction of instructions) {
  const input = instruction.split(". ")[1];
  console.info("");
  console.info("----- ----- -----");
  console.info(instruction);
  console.info(input);
  console.info("----- ----- -----");
  console.info("");
  await invokeCharitesAiChain(chain, input);
}
