#!/usr/bin/env node
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import gradient from "gradient-string";
import util from "util";
import fs from "fs";
import path from "path";

const sleep = (ms = 2000) => new Promise((resolve) => setTimeout(resolve, ms));
const figletPromise = util.promisify(figlet);

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

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const stat = util.promisify(fs.stat);

async function readFiles() {
  const currentDirectory = process.cwd();
  const finalStringArray = [];

  // read files
  const files = await readdir(currentDirectory);

  // iterate over files
  for (const file of files) {
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
    const content = await readFile(filePath, "utf-8");
    finalStringArray.push(content);
  }

  return finalStringArray;
}

(async function () {
  await startingTokenCount();
  const finalStringArray = await readFiles();
  console.log("final string array: ", finalStringArray);
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
