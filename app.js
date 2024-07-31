#!/usr/bin/env node
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import gradient from "gradient-string";
import util from "util";
import fs from "fs/promises";
import path from "path";
import inquirer from "inquirer";

const sleep = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));
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
  return fileObjects.reduce((total, file) => total + file.tokens, 0);
}

function displayFileInfo(fileObjects) {
  fileObjects.forEach((file) => {
    console.log(`${file.filename}: ${file.tokens} tokens`);
  });
  console.log(`Total tokens: ${calculateTotalTokens(fileObjects)}`);
}

function createCheckboxChoices(fileObjects) {
  return fileObjects.map((file) => ({
    name: `${file.filename} (${file.tokens} tokens)`,
    value: file,
    checked: true,
  }));
}

function updateTotalTokens(choices) {
  const selectedFiles = choices
    .filter((choice) => choice.checked)
    .map((choice) => choice.value);
  const totalTokens = calculateTotalTokens(selectedFiles);
  console.log(`Updated total tokens: ${totalTokens}`);
}

function concatenateSelectedFiles(selectedFiles) {
  return selectedFiles.reduce((result, file) => {
    return result + `\`\`\`\n<${file.filename}>:\n${file.contents}\n\`\`\``;
  }, "");
}

async function selectFiles(fileObjects) {
  const { selectedFiles } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedFiles",
      message:
        "Select files to include (use arrow keys and space to toggle, Enter when done):",
      choices: createCheckboxChoices(fileObjects),
      loop: false,
    },
  ]);
  return selectedFiles;
}

async function processFiles(fileObjects) {
  displayFileInfo(fileObjects);
  const selectedFiles = await selectFiles(fileObjects);
  updateTotalTokens(selectedFiles);
  const finalString = concatenateSelectedFiles(selectedFiles);
  console.log("Final concatenated string:");
  console.log(finalString);
}

async function main() {
  await showStartingScreen();
  const currentDir = process.cwd();
  const fileList = await getFilePaths(currentDir);
  const fileObjects = await createFileObjects(fileList);
  const objectsWithTokens = fileObjects.map(addTokenCount);
  await processFiles(objectsWithTokens);
}

main().catch(console.error);

// display list of tokens and allow user to toggle
// add delimiters and filenames and make final string
// allow user to choose a pre-proompt
// copy the final string to the clipboard with the pre-proompt
// save final string to a text file
// display success message
