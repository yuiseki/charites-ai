// import process
import process from "node:process";

// print args
let lastArg: string | undefined = undefined;
if (process.argv.length > 2) {
  //console.log(process.argv);
  // 末尾の引数を取得する
  lastArg = process.argv[process.argv.length - 1];
  console.log(lastArg);
}

import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import {
  SemanticSimilarityExampleSelector,
  PromptTemplate,
  FewShotPromptTemplate,
} from "langchain/prompts";
import { OpenAIChat } from "langchain/llms/openai";
import fs from "node:fs/promises";

// styles/layers/*.yml or *.yaml を配列に読み込む
const stylesBaseDir = "styles/layers";
const styleYamlFilePaths: string[] = [];
const walk = async (dir: string) => {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    if (dirent.isDirectory()) {
      await walk(`${dir}/${dirent.name}`);
    } else {
      if (dirent.name.endsWith(".yml") || dirent.name.endsWith(".yaml")) {
        styleYamlFilePaths.push(`${dir}/${dirent.name}`);
      }
    }
  }
};
await walk(stylesBaseDir);

console.log(styleYamlFilePaths.length);

const styleInformations: {
  name: string;
  instructions: string[];
  description: string[];
  yaml: string[];
  lines: string[];
}[] = [];

for (const styleYamlFilePath of styleYamlFilePaths) {
  const styleYaml = await fs.readFile(styleYamlFilePath, "utf-8");
  const firstLine = styleYaml.split("\n")[0];
  // firstLineが # !charites-ai で始まる場合だけ処理する
  if (!firstLine.startsWith("# !charites-ai")) continue;

  const lines = styleYaml.split("\n");

  // # File name of this style: と書かれた行の位置を取得する
  const styleFileNameLineIndex = lines.findIndex((line) =>
    line.startsWith("# File name of this style:")
  );
  // # File name of this style: と書かれた行の次の行を取得する
  const styleFileNameLine = lines[styleFileNameLineIndex + 1];
  // ファイル名を取得する
  const styleFileName = styleFileNameLine.split("- ")[1];
  // Concise instructions of this style in a few words: と書かれた行の位置を取得する
  const styleInstructionsLineIndex = lines.findIndex((line) =>
    line.startsWith("# Concise instructions of this style in a few words:")
  );
  // Concise instructions of this style in a few words: と書かれた行の次の行から空行までを取得する
  const styleInstructionsLines = lines.slice(
    styleInstructionsLineIndex + 1,
    lines.findIndex(
      (line, idx) => line === "#" && idx > styleInstructionsLineIndex
    )
  );
  const styleInstructions = styleInstructionsLines.map((line) =>
    line.replace("# - ", "")
  );
  // # Description of this style: と書かれた行の位置を取得する
  const styleDescriptionLineIndex = lines.findIndex((line) =>
    line.startsWith("# Description of this style:")
  );
  // # Description of this style: と書かれた行の次の行から空行までを取得する
  const styleDescriptionLines = lines.slice(
    styleDescriptionLineIndex + 1,
    lines.findIndex(
      (line, idx) => line === "#" && idx > styleDescriptionLineIndex
    )
  );
  const styleDescription = styleDescriptionLines;
  // # で始まる行以外を取得する
  // 空行は除く
  const styleLines = lines.filter(
    (line) => !line.startsWith("#") && line !== ""
  );
  styleInformations.push({
    name: styleFileName,
    instructions: styleInstructions,
    description: styleDescription,
    yaml: styleLines,
    lines: lines,
  });
}

console.log(styleInformations.length);

const embeddings = new OpenAIEmbeddings();
const memoryVectorStore = new MemoryVectorStore(embeddings);
const exampleSelector = new SemanticSimilarityExampleSelector({
  vectorStore: memoryVectorStore,
  k: 5,
  inputKeys: ["input"],
});
for (const styleInformation of styleInformations) {
  for (const instruction of styleInformation.instructions) {
    const example = {
      input: instruction,
      output: styleInformation.lines.join("\n"),
    };
    await exampleSelector.addExample(example);
  }
}

const examplePrompt = PromptTemplate.fromTemplate(
  `Input:
{input}

Output:
{output}
`
);

const dynamicPrompt = new FewShotPromptTemplate({
  exampleSelector: exampleSelector,
  examplePrompt: examplePrompt,
  prefix: `You are a YAML file generator. You generate a YAML file based on the examples and input text.
Remember to rewrite the example appropriately according to the intent of the Input, not as is!
You must always, without fail, choose the File name of this style from among the Examples.
You must always, without fail, output YAML based on Examples.
You must always, without fail, does not change File name of this style.
You must always, without fail, output in English.
Do not generate any output that is not in Examples.

Examples:`,
  suffix: `===
Input:
{input}

Output:
`,
  inputVariables: ["input"],
});

const llm = new OpenAIChat({ temperature: 0 });
const chain = dynamicPrompt.pipe(llm);

const result = await chain.invoke({
  input: lastArg ? lastArg : "国の背景を黄色で表示してください。",
});
console.log(result);
console.log("");

const resultLines = result.split("\n");
// resultからFile name of this styleを取得する
// File name of this style: と書かれた行の位置を取得する
const styleFileNameLineIndex = resultLines.findIndex((line) =>
  line.startsWith("# File name of this style:")
);
// File name of this style: と書かれた行の次の行を取得する
const styleFileNameLine = resultLines[styleFileNameLineIndex + 1];
// ファイル名を取得する
const styleFileName = styleFileNameLine.split("# - ")[1];
// stylesBaseDir/styleFileName が存在するか確認する
const styleFilePath = `${stylesBaseDir}/${styleFileName}`;
console.log(styleFilePath);
const styleFileExists = await fs
  .access(styleFilePath)
  .then(() => true)
  .catch(() => false);
// 存在する場合はファイルを書き換える
// 存在しない場合はエラーで終了する
if (styleFileExists) {
  await fs.writeFile(styleFilePath, result + "\n");
} else {
  console.error(`Error: ${styleFilePath} is not found.`);
  process.exit(1);
}
