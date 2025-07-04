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
  ".tgz",
  ".zip",
];

const prompts = {
  1: {
    title: "Error checking",
    body: "Act as a senior software engineer performing a code review. Your task is to review the above coding project for potential bugs. The project files are named and delimited by backticks. Ask questions before starting if you need to understand the project. Your output should be a list of suggested improvements, with brief explanations, and the parts of the code you suggest changing (if necessary.)",
  },
  2: {
    title: "Security vulnerability assessment",
    body: "Act as a senior security engineer performing a code review. Your task is to review the above coding project for security vulnerabilities and suggest ways to make the code more secure. The project files are named and delimited by backticks. Ask questions before starting if you need to, in order to understand the project. Your output should be a list of suggested improvements, with brief explanations, and any parts of the code you are changing (if necessary.)",
  },
  3: {
    title: "Improvements to memory and time complexity",
    body: "Act as a senior software engineer performing a code review. Your task is to review the above coding project for ways to make the code more efficient in terms of memory and time complexity. The project files are named and delimited by backticks. Ask  questions before starting if you need to, in order to understand the project. Your output should be a list of suggested improvements, with brief explanations, and any parts of the code you are changing (if necessary.)",
  },
  4: {
    title: "Add comments and create documentation",
    body: "Act as a senior software engineer. Your task is to create documentation for the above coding project. The project files are named and delimited by backticks. You shall also review the code for readability and add any comments you think are necessary to make the code easier to understand. Ask questions before starting if you need to, in order to understand the project. Your output should be document in the form of a markdown file, plus any additions to the code where you deem it necessary to add comments.",
  },
  5: {
    title: "Add placeholder for requirements for refactoring or new features",
    body: 'Act as a senior software developer and coding mentor. Your task is to refactor the above coding project delimited by triple backticks according to the new requirements in triple quotes. Your output should only be the part of the code you are changing, plus an explanation.\n"""\nPASTE_REQUIREMENTS_HERE\n"""',
  },
  6: {
    title: "Add placeholder for error message for debugging",
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

// recursively get all file paths from dir and subdirs
async function getFilePaths(dir) {
  const fileList = [];
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      try {
        if (item.isDirectory()) {
          if (
            !["node_modules", "dist"].includes(item.name) &&
            !item.name.startsWith(".")
          ) {
            fileList.push(...(await getFilePaths(fullPath)));
          }
        } else if (
          item.isFile() &&
          !item.name.includes("package-lock") &&
          !fileExtentionsToExclude.includes(path.extname(item.name)) &&
          !item.name.startsWith(".")
        ) {
          fileList.push(fullPath);
        }
      } catch (accessError) {
        console.log(
          chalk.yellow(`Warning: Cannot access ${fullPath}. Skipping.`)
        );
      }
    }
  } catch (error) {
    if (error.code === "EACCES") {
      console.error(
        chalk.red(`Error: Permission denied to access directory: ${dir}`)
      );
      console.error(
        chalk.red(
          "Please run the program in a directory where you have appropriate permissions."
        )
      );
      process.exit(1);
    } else {
      console.error(chalk.red(`Error reading directory: ${dir}`), error);
    }
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

// concatenate contents of files together and add delimiters
function concatenateSelectedFiles(selectedFiles) {
  return selectedFiles.reduce((result, file) => {
    return result + `\`\`\`\n<${file.filename}>:\n${file.contents}\n\`\`\``;
  }, "");
}

// user chooses files to include
async function selectFiles(fileObjects) {
  let selectedFiles = [...fileObjects];
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "action",
        message:
          chalk.grey(
          `\n👀 Current token count: ${chalk.white(
              calculateTotalTokens(selectedFiles)
            )})\n`)
           +
          chalk.grey(
            `📉 Reduce this if needed by toggling large or irrelevant files off\n`
          ) +
          chalk.grey(`👇 Use arrow keys and space bar to toggle\n`) +
          chalk.grey(`✅ Hit enter to recalculate token count and proceed\n`),
        choices: fileObjects.map((file) => ({
          name:
            chalk.grey(file.filename) +
            chalk.grey(` (${chalk.cyan(file.tokens)} tokens)`),
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
      chalk.grey(
        `\nUpdated total tokens: ${chalk.white(calculateTotalTokens(selectedFiles))}`
      )
    );
    const { isDone } = await inquirer.prompt([
      {
        type: "confirm",
        name: "isDone",
        message: chalk.white("Are you done selecting files?"),
        default: true,
      },
    ]);
    if (isDone) break;
  }
  return selectedFiles;
}

// let user choose a prompt
async function selectPrompt() {
  console.log(
    chalk.white(
      "\nAdd a prompt or placeholder for requirements/error messages:"
    )
  );

  for (let i = 1; i <= 6; i++) {
    console.log(chalk.grey(`${i}: ${prompts[i].title}`));
  };
  console.log("\n");
  const { choice } = await inquirer.prompt([
    {
      type: "input",
      name: "choice",
      message: chalk.gray("Enter (1-6) or press any key to skip:"),
    },
  ]);
  if (["1", "2", "3", "4", "5", "6"].includes(choice)) {
    return prompts[choice].body;
  };
  return null;
}

// choose files and prompt and concatenate the results together
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

// copy final string to clipboard and display rainbow success animation
async function copyToClipboard(text) {
  try {
    await clipboardy.write(text);
    const successMessage = chalkAnimation.rainbow(
      "\nSuccessfully copied to clipboard. Happy proompting!\n"
    );
    await sleep(1300);
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
