#!/usr/bin/env node
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import gradient from "gradient-string";
import util from "util";
import fs from "fs";

const proompts = {
  1: {
    title: "Error checking",
    body: "Act as a senior software engineer performing a code review. Your task is to review the above coding project for potential bugs. The project files are named and delimited by backticks. Ask questions before starting if you need to understand the project. Your output should be a list of suggested improvements, with brief explanations, and the parts of the code you are changing",
  },
  2: {
    title: "Security vulnerability assessment",
    body: "Act as a senior security engineer performing a code review. Your task is to review the above coding project for security vulnerabilities and suggest ways to make the code more secure. The project files are named and delimited by backticks. Ask questions before starting if you need to understand the project. Your output should be a list of suggested improvements, with brief explanations, and any parts of the code you are changing",
  },
  3: {
    title: "Improvements to memory and time complexity",
    body: "Act as a senior software engineer performing a code review. Your task is to review the above coding project for ways to make the code more efficient in terms of memory and time complexity. The project files are named and delimited by backticks. Ask  questions before starting if you need to understand the project. Your output should be a list of suggested improvements, with brief explanations, and any parts of the code you are changing",
  },
  4: {
    title: "Add comments and create documentation",
    body: "Act as a senior software engineer. Your task is to create documentation for the above coding project. The project files are named and delimited by backticks. You shall also review the code for readability and add any comments you think are necessary to make the code easier to understand. Ask questions before starting if you need to understand the project. Your output should be document in the form of a markdown file, plus any additions to the code where you deem it necessary to add comments",
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

const sleep = (ms = 2000) => new Promise((resolve) => setTimeout(resolve, ms));
const figletPromise = util.promisify(figlet);

async function startingTokenCount() {
  console.clear();

  const msg = `Proompt Cat AI`;

  const data = await figletPromise(msg);

  console.log(gradient.pastel.multiline(data));

  const animatedTitle = chalkAnimation.rainbow(
    "Analysing project...\nCounting tokens..."
  );

  await sleep();
  animatedTitle.stop();
}

// TO-DO - recursively read files from current dir
// read files
// remove files with excluded extensions
// TO-DO - count tokens
// remove blank rows
// add delimiters
// add filenames
// TO-DO - display list of tokens and allow user to toggle
// TO-DO - copy the finalString to the clipboard
// TO-DO - save finalString to a text file
// TO-DO - display success message

startingTokenCount();
