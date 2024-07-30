#!/usr/bin/env node
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import gradient from "gradient-string";
import util from "util";
import fs from "fs/promises";
import path from "path";

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

async function createFileObjects(filePaths) {
  const fileObjects = [];
  for (const filePath of filePaths) {
    // const fullPath = path.join(currentDir, relativePath);
    const content = await readFileContents(filePath);
    if (content !== null) {
      fileObjects.push({
        name: path.basename(filePath),
        contents: content,
      });
    }
  }
  return fileObjects;
}

function countTokens(fileObject) {
  const punctuationRegex =
    /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
  const words = fileObject.contents.split(punctuationRegex).filter(Boolean);
  return words.length;
}

async function main() {
  await showStartingScreen();
  const currentDir = process.cwd();
  const fileList = await getFilePaths(currentDir);
  console.log("file list: ", fileList);
  // const fileNames = getFileNameFromFilePath(fileList, currentDir);
  const fileObjects = await createFileObjects(fileList);
  console.log("file objects: ", fileObjects);
  for (const fileObject of fileObjects) {
    fileObject.tokens = countTokens(fileObject);
  }
  console.log("File objects:", fileObjects);
}

main().catch(console.error);

// count tokens
// remove blank rows (??)
// add delimiters
// add filenames
// display list of tokens and allow user to toggle
// allow user to choose a prompt
// copy the final string to the clipboard
// save final string to a text file
// display success message
// function getFileNameFromFilePath(fileList, currentDir) {
//   return fileList.map((filePath) => {
//     // Remove the current directory from the path
//     let relativePath = filePath.replace(currentDir, "").slice(1);

//     // Replace backslashes with forward slashes
//     relativePath = relativePath.replace(/\\/g, "/");

//     // Get only the filename
//     const parts = relativePath.split("/");
//     return parts[parts.length - 1];
//   });
// }
