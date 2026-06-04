#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");
const mobileDir = join(rootDir, "apps", "mobile");

const results = {
  pass: [],
  warn: [],
  fail: []
};

function rel(path) {
  return relative(rootDir, path).split(sep).join("/");
}

function record(kind, scope, message) {
  results[kind].push({ scope, message });
}

function pass(scope, message) {
  record("pass", scope, message);
}

function warn(scope, message) {
  record("warn", scope, message);
}

function fail(scope, message) {
  record("fail", scope, message);
}

function check(condition, scope, message) {
  if (condition) {
    pass(scope, message);
  } else {
    fail(scope, message);
  }
}

function readText(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function readJson(relativePath) {
  const path = join(rootDir, relativePath);
  if (!existsSync(path)) {
    fail(relativePath, "File is missing.");
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(relativePath, `Invalid JSON: ${error.message}`);
    return null;
  }
}

function commandExists(command) {
  const result = spawnSync(command, ["--version"], {
    cwd: rootDir,
    encoding: "utf8",
    stdio: "pipe"
  });
  return !result.error && result.status === 0;
}

function printSummary() {
  if (results.warn.length) {
    console.log("\nWarnings:");
    for (const item of results.warn) {
      console.log(`- [${item.scope}] ${item.message}`);
    }
  }

  if (results.fail.length) {
    console.log("\nFailures:");
    for (const item of results.fail) {
      console.log(`- [${item.scope}] ${item.message}`);
    }
  }

  console.log("\nFlutter mobile check summary:");
  console.log(`- Passed: ${results.pass.length}`);
  console.log(`- Warnings: ${results.warn.length}`);
  console.log(`- Failures: ${results.fail.length}`);
}

console.log("Loksewa Flutter mobile configuration check");
console.log(`Root: ${rootDir}`);

const rootPackage = readJson("package.json");
const pnpmWorkspace = readText(join(rootDir, "pnpm-workspace.yaml"));
const pubspecPath = join(mobileDir, "pubspec.yaml");
const pubspec = readText(pubspecPath);
const settingsGradle = readText(join(rootDir, "settings.gradle.kts"));

check(existsSync(pubspecPath), "apps/mobile/pubspec.yaml", "Flutter pubspec exists.");
check(existsSync(join(mobileDir, "lib", "main.dart")), "apps/mobile/lib/main.dart", "Flutter entry point exists.");
check(!existsSync(join(mobileDir, "package.json")), "apps/mobile", "Mobile app is not a JS/PNPM package.");

if (rootPackage) {
  const workspaces = Array.isArray(rootPackage.workspaces) ? rootPackage.workspaces : [];
  check(!workspaces.includes("apps/*"), "package.json", "Root JS workspace no longer includes every apps/* folder.");
  check(!workspaces.includes("apps/mobile"), "package.json", "Root JS workspace does not include apps/mobile.");
  check(workspaces.includes("apps/admin-dashboard"), "package.json", "Root JS workspace includes admin dashboard explicitly.");
  check(workspaces.includes("apps/web"), "package.json", "Root JS workspace includes web explicitly.");
  check(Boolean(rootPackage.scripts?.["mobile:flutter:check"]), "package.json", "Flutter mobile check script is present.");
  check(Boolean(rootPackage.scripts?.["mobile:flutter:build:apk"]), "package.json", "Flutter APK build script is present.");
}

check(!pnpmWorkspace.includes("apps/*"), "pnpm-workspace.yaml", "PNPM workspace no longer includes every apps/* folder.");
check(!pnpmWorkspace.includes("apps/mobile"), "pnpm-workspace.yaml", "PNPM workspace does not include apps/mobile.");
check(pnpmWorkspace.includes("apps/admin-dashboard"), "pnpm-workspace.yaml", "PNPM workspace includes admin dashboard explicitly.");
check(pnpmWorkspace.includes("apps/web"), "pnpm-workspace.yaml", "PNPM workspace includes web explicitly.");

check(/name:\s*loksewa_ai_app/.test(pubspec), "apps/mobile/pubspec.yaml", "Flutter package name is present.");
check(/flutter:\s*[\s\S]*uses-material-design:\s*true/.test(pubspec), "apps/mobile/pubspec.yaml", "Flutter material design is enabled.");
check(!/assets\/fonts\//.test(pubspec), "apps/mobile/pubspec.yaml", "No missing local font assets are declared.");

for (const dir of ["assets/images", "assets/icons", "assets/animations", "assets/sounds"]) {
  check(existsSync(join(mobileDir, dir)), rel(join(mobileDir, dir)), "Declared Flutter asset directory exists.");
}

check(
  /if\s*\(\s*enableNativeAndroidLegacy\s*\)\s*\{\s*include\(":app"\)\s*\}/s.test(settingsGradle),
  "settings.gradle.kts",
  "Legacy Kotlin Android app is opt-in through a Gradle property."
);

if (commandExists("flutter")) {
  pass("flutter", "Flutter SDK is available on PATH.");
} else {
  warn("flutter", "Flutter SDK is not available on PATH, so flutter analyze/test/build cannot run on this machine yet.");
}

printSummary();
process.exitCode = results.fail.length > 0 ? 1 : 0;
