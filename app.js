#!/usr/bin/env node
import chalk from "chalk";
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import gradient from "gradient-string";
import util from "util";
import fs from "fs/promises";
import path from "path";
import inquirer from "inquirer";
import clipboardy from "clipboardy";

const sleep = (ms = 1300) => new Promise((resolve) => setTimeout(resolve, ms));
const figletPromise = util.promisify(figlet);

const fileExtentionsToExclude = [
  ".git",
  ".gitignore",
  ".env",
  ".exe",
  ".jpeg",
  ".jpg",
  ".png",
  ".gif",
  ".ico",
  ".svg",
  ".bmp",
  ".tiff",
  ".webp",
  ".mp3",
  ".wav",
  ".mp4",
  ".avi",
  ".mov",
  ".flv",
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".rar",
  ".tar",
  ".gz",
  ".7z",
  ".o",
  ".a",
  ".dll",
  ".so",
  ".dylib",
  ".db",
  ".sqlite",
  ".log",
  ".lock",
  ".bin",
  ".pyc",
  ".toc",
  ".pkg",
  ".pyz",
  ".zip",
  ".spec",
];

async function showStartingScreen() {
  console.clear();
  const msg = `Proompt Cat`;
  const data = await figletPromise(msg);
  console.log(gradient.pastel.multiline(data));
  const animatedTitle = chalkAnimation.rainbow(
    "Analysing project...\nCounting tokens..."
  );
  await sleep();
  animatedTitle.stop();
}

// recursively get all filepaths from directory
async function getFilePaths(dir) {
  const fileList = [];
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        if (!["node_modules", ".git", "dist"].includes(item.name)) {
          fileList.push(...(await getFilePaths(fullPath)));
        }
      } else if (
        item.isFile() &&
        !item.name.includes("package-lock") &&
        !fileExtentionsToExclude.includes(path.extname(item.name))
      ) {
        fileList.push(fullPath);
      }
    }
  } catch (error) {
    console.log("error reading directory: ", dir, error);
  }
  return fileList;
}

async function readFileContents(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return content;
  } catch (error) {
    console.log(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// create an array of objects to hold the filename and contents
async function createFileObjects(filePaths) {
  const fileObjects = [];
  for (const filePath of filePaths) {
    const content = await readFileContents(filePath);
    if (content !== null) {
      fileObjects.push({
        filename: path.basename(filePath),
        contents: content,
      });
    }
  }
  return fileObjects;
}

function countTokens(fileObject) {
  const tokenRegex = /\w+|[^\w\s]+/g;
  const tokens = fileObject.contents.match(tokenRegex);
  return tokens ? tokens.length : 0;
}

// add the token counts to the objects
function addTokenCount(fileObject) {
  return {
    ...fileObject,
    tokens: countTokens(fileObject),
  };
}

function calculateTotalTokens(fileObjects) {
  if (Array.isArray(fileObjects)) {
    return fileObjects.reduce((total, file) => total + file.tokens, 0);
  } else {
    return fileObjects.tokens || 0;
  }
}

function concatenateSelectedFiles(selectedFiles) {
  return selectedFiles.reduce((result, file) => {
    return result + `\`\`\`\n<${file.filename}>:\n${file.contents}\n\`\`\``;
  }, "");
}

async function selectFiles(fileObjects) {
  let selectedFiles = [...fileObjects];
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "action",
        message:
          chalk.yellow(
            `\nSelect files to include (Starting token count: ${chalk.yellow(
              calculateTotalTokens(selectedFiles)
            )})\n`
          ) +
          chalk.green(
            `Reduce token count by toggling large or irrelevant files off\n`
          ) +
          chalk.magenta(`Arrow keys to navigate\n`) +
          chalk.blue(`Space to select/deselect\n`) +
          chalk.red(`Enter when done.\n`),
        choices: fileObjects.map((file) => ({
          name:
            chalk.blue(file.filename) +
            chalk.gray(` (${chalk.yellow(file.tokens)} tokens)`),
          value: file,
          checked: selectedFiles.includes(file),
        })),
        pageSize: 20,
        loop: false,
        instructions: false,
      },
    ]);
    selectedFiles = action;
    console.clear();
    console.log(
      chalk.yellow(
        `Updated total tokens: ${calculateTotalTokens(selectedFiles)}`
      )
    );
    const { isDone } = await inquirer.prompt([
      {
        type: "confirm",
        name: "isDone",
        message: chalk.green("Are you done selecting files?"),
        default: true,
      },
    ]);
    if (isDone) break;
  }
  return selectedFiles;
}

async function processFiles(fileObjects) {
  const selectedFiles = await selectFiles(fileObjects);
  const finalString = concatenateSelectedFiles(selectedFiles);
  // console.log("Final concatenated string:");
  // console.log(finalString);
  return finalString;
}

async function copyToClipboard(text) {
  try {
    await clipboardy.write(text);
    console.log(chalk.green("Project successfully copied to clipboard!"));
  } catch (error) {
    console.error(chalk.red("Failed to copy to clipboard: "), error);
  }
}

async function main() {
  console.clear();
  await showStartingScreen();
  const currentDir = process.cwd();
  const fileList = await getFilePaths(currentDir);
  const fileObjects = await createFileObjects(fileList);
  const objectsWithTokens = fileObjects.map(addTokenCount);
  const finalString = await processFiles(objectsWithTokens);
  await copyToClipboard(finalString);
}

main().catch(console.error);
