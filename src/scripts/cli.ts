#!/usr/bin/env node
import { confirm, input, select } from "@inquirer/prompts";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { execSync } from "child_process";
import { fileURLToPath } from "node:url";
import ora from "ora";
import { copyDirectory } from "./utils/fileHandling.js";
import { chooseItems } from "./utils/inquirerUtils.js";
import {
  cleanUpEnvironmentVariables,
  findAvailablePort,
  runNpmScript,
} from "./utils/cliUtils.js";
import { CONFIG_HELPER_INTRO } from "./utils/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const nextBinary = resolve(__dirname, "..", "node_modules/next/dist/bin/next");
const visualReporterProjectRoot = resolve(__dirname, "..");
const currentPath = process.cwd();

async function main() {
  let filePath: string;
  let reportPath: string;
  let DEBUG_MODE = false;

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
    filePath = await input({
      message: "Please enter the file path:",
    });
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
    reportPath = await input({
      message: "Please enter the file path:",
    });
  }
  const runInDebugMode = await confirm({
    message: "Would you like to run in debug mode?",
  });

  if (runInDebugMode) {
    process.env.VISUAL_REPORT_DEBUG_LEVEL = "debug";
    DEBUG_MODE = true;
  }

  const buildReportSpinner = ora("Building the report...\n").start();
  const reporterPath = join(reportPath, "report");
  try {
    await runNpmScript({
      debug: DEBUG_MODE,
      root: visualReporterProjectRoot,
      script: `NEXT_PUBLIC_VISUAL_REPORT_OUTPUT_JSON_PATH=${filePath} npm run build`,
    });
    buildReportSpinner.succeed("Build report successfully.");
  } catch (error) {
    buildReportSpinner.fail("Failed to build the report.");
    throw error;
  }

  const copyReportSpinner = ora(
    `Copying build output to ${reporterPath}...\n`
  ).start();
  try {
    if (!existsSync(reportPath)) {
      mkdirSync(reportPath, { recursive: true });
    }
    copyDirectory(
      join(visualReporterProjectRoot, ".next"),
      join(reporterPath, ".next")
    );
    copyReportSpinner.succeed(
      `Build output copied successfully to "${reporterPath}".`
    );
  } catch (error) {
    copyReportSpinner.fail(`Failed to copy the output to "${reporterPath}".`);
    throw error;
  }

  const startServer = await confirm({
    message: "Would you like to start the server to show the report?",
  });

  let serverPort = 3000;
  if (startServer) {
    serverPort = Number(
      await input({
        message: "Please enter a custom server port:",
        default: "3000",
      })
    );
    const availablePort = await findAvailablePort(Number(serverPort));

    console.log("Starting the Next.js server...");
    execSync(`${nextBinary} start -p ${availablePort}`, {
      stdio: "inherit",
      cwd: reporterPath,
    });
  } else {
    console.log(
      "\nServer not started. You can start it manually later using the following command:"
    );
    console.log(`${nextBinary} start -p ${serverPort}\n`);
    cleanUpEnvironmentVariables();

    process.exit(0);
  }
}

main().catch((error) => {
  if (error instanceof Error && error.message.includes("User force closed")) {
    console.log("\nProcess was closed by the user.\n");
  } else {
    console.error("An unexpected error occurred:", error);
  }

  cleanUpEnvironmentVariables();
  process.exit(1);
});