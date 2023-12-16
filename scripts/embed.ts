/* eslint-disable @typescript-eslint/no-explicit-any */
// import process
import process from "node:process";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import {
  SemanticSimilarityExampleSelector,
  PromptTemplate,
  FewShotPromptTemplate,
} from "langchain/prompts";
import { OpenAIChat } from "langchain/llms/openai";
import fs from "node:fs/promises";

// import as types
import { BaseLanguageModel } from "langchain/base_language";
import { RunnableSequence } from "langchain/schema/runnable";

// styles/**/*.yml or *.yaml を配列に読み込んで返す関数
const loadStyleYamlFilePaths = async (): Promise<string[]> => {
  const stylesBaseDir = "styles/";
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
  return styleYamlFilePaths;
};

// styleInformation型
type styleInformation = {
  dirName: string;
  fileName: string;
  instructions: string[];
  description: string[];
  yaml: string[];
  lines: string[];
};

// styleYamlFilePathsを読み込んでstyleInformation型の配列にして返す関数
const loadStyleInformations = async (
  filePaths: string[]
): Promise<styleInformation[]> => {
  const styleInformations: styleInformation[] = [];
  for (const styleYamlFilePath of filePaths) {
    const styleYaml = await fs.readFile(styleYamlFilePath, "utf-8");
    const firstLine = styleYaml.split("\n")[0];
    // firstLineが # !charites-ai で始まる場合だけ処理する
    if (!firstLine.startsWith("# !charites-ai")) continue;

    // { を {{ に置換する
    // } を }} に置換する
    const lines = styleYaml.replace(/{/g, "{{").replace(/}/g, "}}").split("\n");

    // # Directory path of this style: と書かれた行の位置を取得する
    const styleDirNameLineIndex = lines.findIndex((line) =>
      line.startsWith("# Directory path of this style:")
    );
    // # Directory path of this style: と書かれた行の次の行を取得する
    const styleDirNameLine = lines[styleDirNameLineIndex + 1];
    // ディレクトリ名を取得する
    const styleDirName = styleDirNameLine.split("- ")[1];

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
    // styleInformation型に変換する
    const styleInformation: styleInformation = {
      dirName: styleDirName,
      fileName: styleFileName,
      instructions: styleInstructions,
      description: styleDescription,
      yaml: styleLines,
      lines: lines,
    };
    styleInformations.push(styleInformation);
  }
  return styleInformations;
};

const setupCharitesAiDynamicPrompt = async (
  exampleStyleInformations: styleInformation[]
) => {
  // run embeddings
  const embeddings = new OpenAIEmbeddings();
  const memoryVectorStore = new MemoryVectorStore(embeddings);
  const exampleSelector = new SemanticSimilarityExampleSelector({
    vectorStore: memoryVectorStore,
    k: 5,
    inputKeys: ["input"],
  });

  for (const styleInformation of exampleStyleInformations) {
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
Inputの言語にかかわらず、常に必ず、英語で出力してください。
Even if the language of Input is not English, you must always, without fail, output in English.
You must always, without fail, output in English.
You must not output in Japanese, Chinese, Korean, Arabic, French, German, Spanish, Portuguese, Russian, or any other language.
Do not generate any output that is not in Examples.

Examples:`,
    suffix: `===
Input:
{input}

Remember, You must always, without fail, output in English.

Output:
`,
    inputVariables: ["input"],
  });
  return dynamicPrompt;
};

const loadCharitesAiChain = async ({
  llm,
  exampleStyleInformations,
}: {
  llm: BaseLanguageModel;
  exampleStyleInformations: styleInformation[];
}): Promise<RunnableSequence<any, any>> => {
  const dynamicPrompt = await setupCharitesAiDynamicPrompt(
    exampleStyleInformations
  );
  const chain = dynamicPrompt.pipe(llm);
  return chain;
};

const invokeCharitesAiChain = async (input: string): Promise<void> => {
  const styleYamlFilePaths = await loadStyleYamlFilePaths();
  console.debug("total styleYamlFilePaths: ", styleYamlFilePaths.length);

  const exampleStyleInformations = await loadStyleInformations(
    styleYamlFilePaths
  );
  console.debug(
    "target exampleStyleInformations: ",
    exampleStyleInformations.length
  );

  console.debug("");
  console.debug("loading charites-ai chain...");
  console.debug("");

  const llm = new OpenAIChat({ temperature: 0 });
  const chain = await loadCharitesAiChain({ llm, exampleStyleInformations });
  console.debug("charites-ai chain loaded.");
  console.debug("");

  const result = await chain.invoke({
    input: input,
  });
  console.info(result);
  console.info("");

  // resultに日本語が含まれている場合はエラーで終了する
  if (result.match(/[ぁ-んァ-ン一-龥]/)) {
    console.error(`Error: ${result} includes Japanese.`);
    process.exit(1);
  }
  // {{ を { に置換する
  // }} を } に置換する
  const convertedResult = result.replace(/{{/g, "{").replace(/}}/g, "}");
  const resultLines = result.split("\n");
  // resultからFile name of this styleを取得する
  // File name of this style: と書かれた行の位置を取得する
  const styleFileNameLineIndex = resultLines.findIndex((line: string) =>
    line.startsWith("# File name of this style:")
  );
  // File name of this style: と書かれた行の次の行を取得する
  const styleFileNameLine = resultLines[styleFileNameLineIndex + 1];
  // ファイル名を取得する
  const styleFileName = styleFileNameLine.split("# - ")[1];
  console.debug("result is correct YAML.");
  console.debug("");
  const outputDir = "styles/charites-ai/layers";
  // outputDir/styleFileName が存在するか確認する
  const styleFilePath = `${outputDir}/${styleFileName}`;
  const styleFileExists = await fs
    .access(styleFilePath)
    .then(() => true)
    .catch(() => false);
  if (styleFileExists) {
    // 存在する場合はファイルを書き換える
    console.info("Update existing style YAML file", styleFilePath);
    await fs.writeFile(styleFilePath, convertedResult + "\n");
  } else {
    // 存在しない場合はファイルに書き出したあとで
    // styles/charites-ai/style.yml を編集しなければならない
    console.info("Create new style YAML file", styleFilePath);
    console.info("");
    await fs.writeFile(styleFilePath, convertedResult + "\n");
    const styleFileRelativePath = styleFilePath.replace(
      "styles/charites-ai",
      ""
    );
    // styles/charites-ai/style.yml を編集する
    const stylesYamlDefineFilePath = "styles/charites-ai/style.yml";
    const stylesYamlDefine = await fs.readFile(
      stylesYamlDefineFilePath,
      "utf-8"
    );
    const styleYamlDefineLines = stylesYamlDefine.split("\n");
    // `  - !!inc/file existingStyleYamlFilePath` と書かれた行が多数あり、その最後の次の行に、
    // `  - !!inc/file styleFileRelativePath`
    // のように追加する
    // そのため、`  - !!inc/file` で始まる最後の行の行数を取得する
    const lastIncFileLineIndex = styleYamlDefineLines
      .map((line, idx) => (line.startsWith("  - !!inc/file") ? idx : -1))
      .filter((idx) => idx !== -1)
      .pop();
    // lastIncFileLineIndexがundefinedだったらファイルの末尾に追加する
    if (lastIncFileLineIndex === undefined) {
      styleYamlDefineLines.push(`  - !!inc/file ${styleFileRelativePath}`);
    } else {
      // 最後の行の次の行に、`  - !!inc/file styleFileRelativePath` を追加する
      styleYamlDefineLines.splice(
        lastIncFileLineIndex + 1,
        0,
        `  - !!inc/file ${styleFileRelativePath}`
      );
    }
    console.debug(styleYamlDefineLines.join("\n"));
    console.info(
      "Update existing styles YAML define file",
      stylesYamlDefineFilePath
    );
    await fs.writeFile(
      stylesYamlDefineFilePath,
      styleYamlDefineLines.join("\n")
    );
  }
  console.info("charites-ai chain finished.");
};

let lastArg: string | undefined = undefined;
if (process.argv.length > 2) {
  // 末尾の引数を取得する
  lastArg = process.argv[process.argv.length - 1];
}

// lastArgが無かったらエラーで終了する
if (!lastArg) {
  console.error("Error: No input.");
  process.exit(1);
}

console.debug("input: ", lastArg);
console.debug("");

await invokeCharitesAiChain(lastArg);
