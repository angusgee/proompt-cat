#!/usr/bin/env node
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import gradient from "gradient-string";
import util from "util";
import fs from "fs";
import path from "path";

const sleep = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));
const figletPromise = util.promisify(figlet);
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const stat = util.promisify(fs.stat);

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

async function startingTokenCount() {
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

async function readFiles() {
  const currentDirectory = process.cwd();
  const finalStringArray = [];

  // read files
  const files = await readdir(currentDirectory);
  console.log("list of files to process: ", files);

  // create new array with unwanted file types removed
  const cleanedArray = [];

  for (const file of files) {
    const fileParts = file.split(".");
    const fileExtension = "." + fileParts[fileParts.length - 1];
    // console.log(fileExtension);
    if (!files.includes(fileExtension)) {
      cleanedArray.push(file);
    }
  }

  console.log(
    "cleaned array with unwanted file extentions removed: ",
    cleanedArray
  );

  // iterate over files
  for (const file of cleanedArray) {
    // exclude package-lock file
    if (file === "package-lock.json") {
      continue;
    }

    const filePath = path.join(currentDirectory, file);

    // exclude node modules folder
    if (filePath.includes("node_modules/")) {
      continue;
    }

    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      continue;
    }

    // read contents and append to final string array
    // TO-DO - add filenames and delimiters
    const content = await readFile(filePath, "utf-8");
    finalStringArray.push(content);
  }

  return finalStringArray;
}

(async function () {
  await startingTokenCount();
  const finalStringArray = await readFiles();
  const finalString = finalStringArray.join("\n");
  // console.log("final string array: ", finalStringArray);
  console.log("final string: ", finalString);
})();

// TO-DO - recursively read files from current dir
// read files
// remove files with excluded extensions
// TO-DO - count tokens
// remove blank rows
// add delimiters
// add filenames
// TO-DO - display list of tokens and allow user to toggle
// TO-DO - copy the final string to the clipboard
// TO-DO - save final string to a text file
// TO-DO - display success message
