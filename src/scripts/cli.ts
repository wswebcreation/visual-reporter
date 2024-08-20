#!/usr/bin/env node
import { input, select } from "@inquirer/prompts";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

// Intro message
export const CONFIG_HELPER_INTRO = `
=================================
🤖 WDIO Visual Reporter Wizard 🧙
=================================
`;

const currentPath = process.cwd();

function listItems({
  folderPath,
  includeFiles,
}: {
  folderPath: string;
  includeFiles: boolean;
}) {
  const items = readdirSync(folderPath, { withFileTypes: true });
  const choices = items
    .filter((item) => {
      const trimmedName = item.name.trim();
      if (item.isDirectory() && !item.name.startsWith("node_modules")) {
        return true;
      }

      if (includeFiles) {
        return /\.json$/i.test(trimmedName);
      }

      return false;
    })
    .map((item) => {
      const isDirectory = item.isDirectory();
      const value = item.name + (isDirectory ? "/" : "");
      return {
        name: value,
        value,
      };
    });

  if (resolve(folderPath) !== resolve("/")) {
    choices.push({
      name: "\x1b[36m↩ Go Back\x1b[0m",
      value: "..",
    });
  }

  if (!includeFiles) {
    choices.unshift({
      name: `This folder: ${folderPath}`,
      value: `selected-folder:${folderPath}`,
    });
  }

  return choices;
}

function clearPreviousPromptLines(message: string) {
  const terminalWidth = process.stdout.columns || 80;
  const lineCount = Math.ceil(message.length / terminalWidth);

  for (let i = 0; i < lineCount; i++) {
    process.stdout.write("\u001b[1A");
    process.stdout.write("\u001b[2K");
  }
}

async function chooseItems({
  currentPath,
  includeFiles = false,
}: {
  currentPath: string;
  includeFiles?: boolean;
}): Promise<string> {
  async function prompt(srcPath: string): Promise<string> {
    const promptMessage = `Please choose the Visual Testing output.json file (current folder: ${srcPath})`;
    const choices = listItems({ folderPath: srcPath, includeFiles });
    const answers = await select({
      message: promptMessage,
      choices: choices,
    });
    const newPath = join(srcPath, answers);

    if (
      (answers === ".." || answers.endsWith("/")) &&
      !answers.startsWith("selected-folder:")
    ) {
      clearPreviousPromptLines(promptMessage);
      return prompt(newPath);
    } else if (answers.startsWith("selected-folder:")) {
      return answers.split(":")[1];
    }

    return newPath;
  }

  return prompt(currentPath);
}

async function main() {
  let filePath: string;
  let reportPath: string;
  console.log(CONFIG_HELPER_INTRO);

  const initialChoice = await select<{ method: "explore" | "type" }>({
    message: "How would you like to specify the file?",
    choices: [
      { name: 'Use a "file explorer"', value: { method: "explore" } },
      { name: "Type the file path manually", value: { method: "type" } },
    ],
  });

  if (initialChoice.method === "explore") {
    filePath = await chooseItems({ currentPath, includeFiles: true });
  } else {
    const pathInput = await input({
      message: "Please enter the file path:",
    });
    filePath = pathInput;
  }

  const reportFolderChoice = await select<{ method: "explore" | "type" }>({
    message: "Where do you want the Visual Report to be created?",
    choices: [
      { name: 'Use a "file explorer"', value: { method: "explore" } },
      { name: "Type the file path manually", value: { method: "type" } },
    ],
  });

  if (reportFolderChoice.method === "explore") {
    reportPath = await chooseItems({ currentPath });
  } else {
    const pathInput = await input({
      message: "Please enter the file path:",
    });
    reportPath = pathInput;
  }

  console.log(`Selected file: ${filePath}`);
  console.log(`Selected file: ${reportPath}`);
}

main();
