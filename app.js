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

const prompts = {
  1: {
    title: "Error checking",
    body: "Act as a senior software engineer performing a code review. Your task is to review the above coding project for potential bugs. The project files are named and delimited by backticks. Ask questions before starting if you need to understand the project. Your output should be a list of suggested improvements, with brief explanations, and the parts of the code you are changing.",
  },
  2: {
    title: "Security vulnerability assessment",
    body: "Act as a senior security engineer performing a code review. Your task is to review the above coding project for security vulnerabilities and suggest ways to make the code more secure. The project files are named and delimited by backticks. Ask questions before starting if you need to understand the project. Your output should be a list of suggested improvements, with brief explanations, and any parts of the code you are changing.",
  },
  3: {
    title: "Improvements to memory and time complexity",
    body: "Act as a senior software engineer performing a code review. Your task is to review the above coding project for ways to make the code more efficient in terms of memory and time complexity. The project files are named and delimited by backticks. Ask  questions before starting if you need to understand the project. Your output should be a list of suggested improvements, with brief explanations, and any parts of the code you are changing.",
  },
  4: {
    title: "Add comments and create documentation",
    body: "Act as a senior software engineer. Your task is to create documentation for the above coding project. The project files are named and delimited by backticks. You shall also review the code for readability and add any comments you think are necessary to make the code easier to understand. Ask questions before starting if you need to understand the project. Your output should be document in the form of a markdown file, plus any additions to the code where you deem it necessary to add comments.",
  },
  5: {
    title: "Provide requirements for refactoring or additions to code",
    body: 'Act as a senior software developer and coding mentor. Your task is to refactor the above coding project delimited by triple backticks according to the new requirements in triple quotes. Your output should only be the part of the code you are changing, plus an explanation.\n"""\nPASTE_REQUIREMENTS_HERE\n"""',
  },
  6: {
    title: "Provide error message for debugging",
    body: 'Act as a senior software developer and coding mentor. Your task is to correct the above coding project to fix the errors. The project files are named and delimited by backticks. The error messages are delimited by triple quotes. Your output should only be the part of the code you are changing, plus explanations of your proposed fixes.\n """\nPASTE_ERROR_MESSAGES_HERE\n"""',
  },
};

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
            `\n💡 Select files to include (Starting token count: ${chalk.yellow(
              calculateTotalTokens(selectedFiles)
            )})\n`
          ) +
          chalk.blue(
            `💡 Reduce token count by toggling large or irrelevant files off\n`
          ) +
          chalk.blue(`💡 Space to select/deselect || a to select all\n`) +
          chalk.blue(`💡 Arrow keys to navigate\n`) +
          chalk.yellow(`💡 Enter when done.\n`),
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

async function selectPrompt() {
  console.log(
    chalk.yellow(
      "\nSelect a prompt (or any other key to continue without a prompt):"
    )
  );
  for (let i = 1; i <= 6; i++) {
    console.log(chalk.cyan(`${i}: ${prompts[i].title}`));
  }
  const { choice } = await inquirer.prompt([
    {
      type: "input",
      name: "choice",
      message: chalk.yellow("Enter your choice (1-6):"),
    },
  ]);
  if (["1", "2", "3", "4", "5", "6"].includes(choice)) {
    return prompts[choice].body;
  }
  return null;
}

async function processFiles(fileObjects) {
  const selectedFiles = await selectFiles(fileObjects);
  let finalString = "";
  const selectedPrompt = await selectPrompt();
  if (selectedPrompt) {
    finalString += selectedPrompt + "\n\n";
  }
  finalString += concatenateSelectedFiles(selectedFiles);
  return finalString;
}

async function copyToClipboard(text) {
  try {
    await clipboardy.write(text);
    const successMessage = chalkAnimation.rainbow(
      "\nSuccessfully copied to clipboard. Happy proompting!"
    );
    await sleep(1700);
    successMessage.stop();
  } catch (error) {
    console.error(chalk.red("\nFailed to copy to clipboard: "), error);
  }
}

async function main() {
  await showStartingScreen();
  const currentDir = process.cwd();
  const fileList = await getFilePaths(currentDir);
  const fileObjects = await createFileObjects(fileList);
  const objectsWithTokens = fileObjects.map(addTokenCount);
  const finalString = await processFiles(objectsWithTokens);
  await copyToClipboard(finalString);
}

main().catch(console.error);
