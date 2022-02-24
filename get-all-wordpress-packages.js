#!/usr/bin/env node
import { access, readFile } from "fs/promises";
import { constants } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { spawnSync } from "child_process";

const args = process.argv.slice(2);
if (!args[0]) {
  console.error("Please pass a path to the gutenberg checkout.");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const gutenbergPackageJson = resolve(__dirname, args[0], "package.json");

try {
  await access(gutenbergPackageJson, constants.R_OK);
} catch {
  console.error("Could not access Gutenberg package.json");
  process.exit(1);
}

const gutenbergPackageFile = await readFile(gutenbergPackageJson, "utf-8");
const gutenbergInfo = JSON.parse(gutenbergPackageFile);

// Assumes that every '@wordpress' package is listed in the top-level Gutenberg package.json
const allGutenbergDeps = [
  ...Object.keys(gutenbergInfo.dependencies),
  ...Object.keys(gutenbergInfo.devDependencies),
];

const allWordPressPackages = allGutenbergDeps.filter((dep) =>
  dep.startsWith("@wordpress/")
);

console.log(allWordPressPackages);
console.log(
  `Found ${allWordPressPackages.length} "@wordpress/" dependencies in Gutenberg.`
);

// note: num installed logic not working.
let numInstalled = 0;
for (const wpPackage of allWordPressPackages) {
  try {
    spawnSync("yarn", ["add", wpPackage], { stdio: "inherit" });
    numInstalled++;
  } catch (e) {
    console.info(`${wpPackage} was probably not added.`);
    console.info(e.message);
  }
}

console.log(
  `Successfully added ${numInstalled} packages out of ${
    allWordPressPackages.length
  }. ${
    allWordPressPackages.length - numInstalled
  } deps failed to install. They may not be published to npm.`
);
