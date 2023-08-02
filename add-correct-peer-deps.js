#!/usr/bin/env node
import { access, readFile, writeFile } from "fs/promises";
import { constants } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { execSync } from "child_process";

const args = process.argv.slice(2);
if (!args[0]) {
  console.error("Please pass a path to the gutenberg checkout.");
  process.exit(1);
}
const gutenbergPath = args[0];

const data = execSync("yarn install --json").toString().split("\n");
const errors = data
  .map((entry) => {
    console.log(entry);
    try {
      return JSON.parse(entry);
    } catch {}
  })
  .filter((entry) => !!entry);

const peerDepWarnings = errors.filter(({ name }) => name === 2);

const peerDepVersions = {
  react: "^18.0.0",
  "react-dom": "^18.0.0",
};

// map of "packageName": peerDepToAdd[]
const fixes = {};
for (const { data: warning } of peerDepWarnings) {
  const targetPackage = warning.match(/@wordpress\/(.*?)@/);
  if (!targetPackage || typeof !targetPackage[1] === "string") {
    continue;
  }
  const brokenPkg = targetPackage[1];

  const depMatch = warning.match(/doesn't provide (.*?) /);
  if (!depMatch || typeof !depMatch[1] === "string") {
    continue;
  }
  const neededDep = depMatch[1];

  if (!fixes[brokenPkg]) {
    fixes[brokenPkg] = new Set();
  }
  fixes[brokenPkg].add(neededDep);
}

const __dirname = dirname(fileURLToPath(import.meta.url));

for (const [pkg, fix] of Object.entries(fixes)) {
  console.log(pkg, fix);
  const packageJson = resolve(
    __dirname,
    gutenbergPath,
    "packages",
    pkg,
    "package.json"
  );
  try {
    await access(packageJson, constants.R_OK);
  } catch {
    console.error(`Could not access package.json at ${packageJson}`);
    process.exit(1);
  }

  const packageFile = await readFile(packageJson, "utf-8");
  const packageInfo = JSON.parse(packageFile);

  if (!packageInfo.peerDependencies) {
    packageInfo.peerDependencies = {};
  }

  for (const peerDep of fix) {
    packageInfo.peerDependencies[peerDep] = peerDepVersions[peerDep];
  }
  await writeFile(packageJson, JSON.stringify(packageInfo, null, "\t"));
  console.log(`Updated peer deps in ${packageJson}`);
}
