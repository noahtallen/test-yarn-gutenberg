#!/usr/bin/env node
import { access, readFile, writeFile } from "fs/promises";
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
const gutenbergPackagesPath = resolve(__dirname, args[0], "packages");

try {
  await access(gutenbergPackagesPath, constants.R_OK);
} catch {
  console.error("Could not access Gutenberg packages");
  process.exit(1);
}

// Our package file
const packagePath = resolve(__dirname, "package.json");
const packageFile = await readFile(packagePath, "utf-8");
const packageInfo = JSON.parse(packageFile);

if (!packageInfo.resolutions) {
  packageInfo.resolutions = {};
}

for (const [packageId] of Object.entries(packageInfo.dependencies)) {
  const packageMatch = packageId.match(/@wordpress\/(.*)/);
  if (!packageMatch || typeof !packageMatch[1] === "string") {
    continue;
  }
  const packageName = packageMatch[1];
  packageInfo.resolutions[
    packageId
  ] = `portal:${args[0]}/packages/${packageName}`;
}

await writeFile(packagePath, JSON.stringify(packageInfo, null, 2));
