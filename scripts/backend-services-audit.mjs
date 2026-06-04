#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");
const args = new Set(process.argv.slice(2));

const options = {
  staticOnly: args.has("--static-only"),
  skipBackendSmoke: args.has("--skip-backend-smoke"),
  skipServiceBuilds: args.has("--skip-service-builds"),
  skipServiceTypechecks: args.has("--skip-service-typechecks")
};

if (options.staticOnly) {
  options.skipBackendSmoke = true;
  options.skipServiceBuilds = true;
  options.skipServiceTypechecks = true;
}

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

function readText(relativePath) {
  const path = join(rootDir, relativePath);
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf8");
}

function readJson(relativePath) {
  const text = readText(relativePath);
  if (text === null) {
    fail(relativePath, "File is missing.");
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    fail(relativePath, `Invalid JSON: ${error.message}`);
    return null;
  }
}

function listDirectories(relativePath) {
  const path = join(rootDir, relativePath);
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => join(path, entry.name))
    .sort((a, b) => rel(a).localeCompare(rel(b)));
}

function hasTsSource(packageDir) {
  const srcDir = join(packageDir, "src");
  if (!existsSync(srcDir)) return false;
  const queue = [srcDir];
  while (queue.length) {
    const current = queue.shift();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(path);
      } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        return true;
      }
    }
  }
  return false;
}

function runCommand(scope, command, commandArgs) {
  const printable = [command, ...commandArgs].join(" ");
  console.log(`\n==> ${scope}`);
  console.log(`$ ${printable}`);
  const spawnOptions = {
    cwd: rootDir,
    env: { ...process.env, CI: process.env.CI ?? "1" },
    stdio: "inherit"
  };
  const result = process.platform === "win32"
    ? spawnSync([command, ...commandArgs.map((arg) => `"${String(arg).replace(/"/g, "\\\"")}"`)].join(" "), {
      ...spawnOptions,
      shell: true
    })
    : spawnSync(command, commandArgs, spawnOptions);

  if (result.error) {
    const message = `Could not start command "${printable}": ${result.error.message}`;
    console.log(`Command error: ${message}`);
    fail(scope, message);
    return;
  }

  if (result.status === 0) {
    console.log(`Command passed: ${printable}`);
    pass(scope, `Command passed: ${printable}`);
  } else {
    const message = `Command failed with exit code ${result.status}: ${printable}`;
    console.log(`Command failed: ${message}`);
    fail(scope, message);
  }
}

function skipCommand(scope, message) {
  console.log(`\n==> ${scope}`);
  console.log(`Skipped: ${message}`);
  warn(scope, message);
}

function normalizeDockerfile(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const instructions = [];
  let current = "";
  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (current) current += " ";
    current += trimmed.replace(/\\$/, "").trim();
    if (!trimmed.endsWith("\\")) {
      instructions.push(current);
      current = "";
    }
  }
  if (current) instructions.push(current);
  return instructions;
}

function tokenizeInstruction(input) {
  const tokens = [];
  let token = "";
  let quote = null;
  let escaped = false;

  for (const char of input) {
    if (escaped) {
      token += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (quote) {
      if (char === quote) {
        quote = null;
      } else {
        token += char;
      }
      continue;
    }
    if (char === "\"" || char === "'") {
      quote = char;
      continue;
    }
    if (/\s/.test(char)) {
      if (token) {
        tokens.push(token);
        token = "";
      }
      continue;
    }
    token += char;
  }

  if (token) tokens.push(token);
  return tokens;
}

function wildcardToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/\*/g, ".*").replace(/\?/g, ".")}$`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pathMatchesPattern(pattern) {
  const parts = pattern.split("/").filter(Boolean);
  let candidates = [rootDir];

  for (const part of parts) {
    const next = [];
    const hasWildcard = part.includes("*") || part.includes("?");
    const matcher = hasWildcard ? wildcardToRegExp(part) : null;
    for (const candidate of candidates) {
      if (!existsSync(candidate) || !statSync(candidate).isDirectory()) continue;
      for (const entry of readdirSync(candidate, { withFileTypes: true })) {
        if ((hasWildcard && matcher.test(entry.name)) || (!hasWildcard && entry.name === part)) {
          next.push(join(candidate, entry.name));
        }
      }
    }
    candidates = next;
  }

  return candidates.length > 0;
}

function getCopySources(instruction) {
  const body = instruction.replace(/^COPY\s+/i, "").trim();
  if (/--from=/i.test(body)) return [];

  if (body.startsWith("[")) {
    try {
      const json = JSON.parse(body);
      return Array.isArray(json) ? json.slice(0, -1) : [];
    } catch {
      return [];
    }
  }

  const tokens = tokenizeInstruction(body).filter((token) => !token.startsWith("--"));
  return tokens.length > 1 ? tokens.slice(0, -1) : [];
}

function packageMap(workspacePackages) {
  const map = new Map();
  for (const item of workspacePackages) {
    if (item.packageJson?.name) {
      map.set(item.packageJson.name, item);
    }
  }
  return map;
}

function isBackendServicePackage(item) {
  const packageRel = rel(item.dir);
  return packageRel.startsWith("services/") || packageRel.startsWith("packages/");
}

function expandWorkspacePatterns(patterns) {
  const packageDirs = new Set();
  for (const pattern of patterns) {
    if (!pattern.endsWith("/*")) {
      const packageDir = join(rootDir, pattern);
      if (!existsSync(packageDir)) {
        fail("workspaces", `Workspace package directory is missing: ${pattern}`);
        continue;
      }
      if (!existsSync(join(packageDir, "package.json"))) {
        warn("workspaces", `Workspace package directory has no package.json and is skipped: ${pattern}`);
        continue;
      }
      packageDirs.add(packageDir);
      continue;
    }
    const baseDir = join(rootDir, pattern.slice(0, -2));
    if (!existsSync(baseDir)) {
      fail("workspaces", `Workspace base directory is missing: ${pattern.slice(0, -2)}`);
      continue;
    }
    for (const entry of readdirSync(baseDir, { withFileTypes: true })) {
      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        packageDirs.add(join(baseDir, entry.name));
      }
    }
  }
  return [...packageDirs].sort((a, b) => rel(a).localeCompare(rel(b)));
}

function auditRootWorkspace() {
  const rootPackage = readJson("package.json");
  if (!rootPackage) return { rootPackage: null, workspacePackages: [] };

  const workspaces = Array.isArray(rootPackage.workspaces) ? rootPackage.workspaces : [];
  const hasJsAppWorkspaces = workspaces.includes("apps/*")
    || (workspaces.includes("apps/admin-dashboard") && workspaces.includes("apps/web"));
  check(workspaces.includes("services/*"), "package.json", "Root workspaces include services/*.");
  check(hasJsAppWorkspaces, "package.json", "Root workspaces include the JS app packages.");
  check(workspaces.includes("packages/*"), "package.json", "Root workspaces include packages/*.");
  check(Boolean(rootPackage.scripts?.build), "package.json", "Root build script is present.");
  check(Boolean(rootPackage.scripts?.typecheck), "package.json", "Root typecheck script is present.");
  check(Boolean(rootPackage.scripts?.["audit:backend-services"]), "package.json", "Backend/services audit script is present.");
  check(Boolean(rootPackage.scripts?.["audit:backend-services:static"]), "package.json", "Static backend/services audit script is present.");
  check(Boolean(rootPackage.engines?.node?.includes("22")), "package.json", "Root Node engine targets Node 22.");

  const pnpmWorkspace = readText("pnpm-workspace.yaml");
  const pnpmHasJsAppWorkspaces = Boolean(pnpmWorkspace?.includes("apps/*"))
    || (Boolean(pnpmWorkspace?.includes("apps/admin-dashboard")) && Boolean(pnpmWorkspace?.includes("apps/web")));
  check(Boolean(pnpmWorkspace?.includes("services/*")), "pnpm-workspace.yaml", "PNPM workspace includes services/*.");
  check(pnpmHasJsAppWorkspaces, "pnpm-workspace.yaml", "PNPM workspace includes the JS app packages.");
  check(Boolean(pnpmWorkspace?.includes("packages/*")), "pnpm-workspace.yaml", "PNPM workspace includes packages/*.");

  const nodeVersion = readText(".node-version")?.trim();
  check(Boolean(nodeVersion), ".node-version", "Node version file is present.");
  if (nodeVersion) {
    check(/^22(\.|$)/.test(nodeVersion), ".node-version", `Node version is pinned to 22.x (${nodeVersion}).`);
  }

  const currentNodeMajor = Number(process.versions.node.split(".")[0]);
  if (currentNodeMajor === 22) {
    pass("node", `Current Node runtime matches the repo target (${process.version}).`);
  } else {
    warn("node", `Current Node runtime is ${process.version}; repo config targets Node 22.`);
  }

  const workspacePackages = expandWorkspacePatterns(workspaces).map((packageDir) => {
    const packagePath = join(packageDir, "package.json");
    const packageJson = existsSync(packagePath) ? readJson(rel(packagePath)) : null;
    return { dir: packageDir, packageJson };
  });

  return { rootPackage, workspacePackages };
}

function auditWorkspacePackages(workspacePackages) {
  const names = new Map();
  const pnpmLock = readText("pnpm-lock.yaml");
  for (const item of workspacePackages) {
    const packageRel = rel(item.dir);
    const packagePath = join(item.dir, "package.json");
    const hasDockerfile = existsSync(join(item.dir, "Dockerfile"));
    const hasSrc = existsSync(join(item.dir, "src"));
    const isService = packageRel.startsWith("services/");
    const isAuditedBackendPackage = packageRel.startsWith("services/") || packageRel.startsWith("packages/");

    if (!existsSync(packagePath)) {
      if (isService || hasDockerfile || hasSrc) {
        fail(packageRel, "Workspace directory is missing package.json.");
      } else {
        warn(packageRel, "Workspace directory is missing package.json and is skipped by package checks.");
      }
      continue;
    }

    if (pnpmLock && isAuditedBackendPackage) {
      check(new RegExp(`^\\s{2}${escapeRegExp(packageRel)}:\\s*$`, "m").test(pnpmLock), "pnpm-lock.yaml", `Lockfile has importer for ${packageRel}.`);
    } else if (!pnpmLock) {
      fail("pnpm-lock.yaml", "Lockfile is missing.");
    }

    const packageJson = item.packageJson;
    check(Boolean(packageJson?.name), packageRel, "package.json has a package name.");
    if (packageJson?.name) {
      if (names.has(packageJson.name)) {
        fail(packageRel, `Duplicate package name also used by ${names.get(packageJson.name)}: ${packageJson.name}`);
      } else {
        names.set(packageJson.name, packageRel);
      }
    }

    check(Boolean(packageJson?.scripts?.build), packageRel, "build script is present.");
    if (isAuditedBackendPackage && (hasTsSource(item.dir) || existsSync(join(item.dir, "tsconfig.json")))) {
      check(existsSync(join(item.dir, "tsconfig.json")), packageRel, "TypeScript package has tsconfig.json.");
      check(Boolean(packageJson?.scripts?.typecheck), packageRel, "TypeScript package has a typecheck script.");
    }

  }

  const availableNames = new Set([...names.keys()]);
  for (const item of workspacePackages) {
    const packageJson = item.packageJson;
    if (!packageJson) continue;
    const packageRel = rel(item.dir);
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    for (const [name, version] of Object.entries(dependencies)) {
      if (version === "workspace:*" && !availableNames.has(name)) {
        fail(packageRel, `Workspace dependency target is missing: ${name}`);
      }
    }
  }
}

function auditBackend() {
  const backendPackage = readJson("backend/package.json");
  if (!backendPackage) return;
  check(Boolean(backendPackage.scripts?.build), "backend/package.json", "Backend build script is present.");
  check(Boolean(backendPackage.scripts?.test), "backend/package.json", "Backend smoke test script is present.");
  check(Boolean(backendPackage.scripts?.typecheck), "backend/package.json", "Backend typecheck script is present.");
  check(Boolean(backendPackage.scripts?.["render:build"]), "backend/package.json", "Backend Render build script is present.");
  check(Boolean(backendPackage.scripts?.["render:start"]), "backend/package.json", "Backend Render start script is present.");
  check(Boolean(backendPackage.engines?.node?.includes("22")), "backend/package.json", "Backend Node engine targets Node 22.");
  check(existsSync(join(rootDir, "backend/tests/app.test.mjs")), "backend/tests", "Backend smoke test file exists.");
  check(existsSync(join(rootDir, "backend/Dockerfile")), "backend/Dockerfile", "Backend Dockerfile exists.");
}

function auditServicePackages() {
  const serviceDirs = listDirectories("services");
  check(serviceDirs.length > 0, "services", "Service directories are present.");

  for (const serviceDir of serviceDirs) {
    const serviceName = basename(serviceDir);
    const packagePath = join(serviceDir, "package.json");
    const dockerfilePath = join(serviceDir, "Dockerfile");
    const hasSrc = existsSync(join(serviceDir, "src"));
    const hasDockerfile = existsSync(dockerfilePath);

    if (hasSrc || hasDockerfile) {
      check(existsSync(packagePath), `services/${serviceName}`, "Service package.json is present.");
    }

    if (existsSync(packagePath)) {
      const packageJson = readJson(rel(packagePath));
      check(packageJson?.name === `@loksewa/${serviceName}`, `services/${serviceName}`, `Service package name matches @loksewa/${serviceName}.`);
      check(Boolean(packageJson?.scripts?.build), `services/${serviceName}`, "Service build script is present.");
      check(Boolean(packageJson?.scripts?.start), `services/${serviceName}`, "Service start script is present.");
      if (hasTsSource(serviceDir)) {
        check(Boolean(packageJson?.scripts?.typecheck), `services/${serviceName}`, "Service typecheck script is present.");
      }
    }
  }
}

function auditDockerfiles(workspacePackages) {
  const workspaceByName = packageMap(workspacePackages);
  const dockerfiles = [
    join(rootDir, "backend/Dockerfile"),
    ...listDirectories("services").map((dir) => join(dir, "Dockerfile")),
  ].filter((path) => existsSync(path));

  check(dockerfiles.length > 0, "Dockerfiles", "Dockerfiles were discovered.");

  for (const dockerfile of dockerfiles) {
    const dockerRel = rel(dockerfile);
    const text = readFileSync(dockerfile, "utf8");
    const instructions = normalizeDockerfile(text);
    const instructionText = instructions.join("\n");

    check(/^FROM\s+/im.test(instructionText), dockerRel, "Dockerfile has a FROM instruction.");
    check(/\bWORKDIR\s+/im.test(instructionText), dockerRel, "Dockerfile has a WORKDIR instruction.");
    check(/\b(CMD|ENTRYPOINT)\s+/im.test(instructionText), dockerRel, "Dockerfile has a CMD or ENTRYPOINT.");
    check(/\bEXPOSE\s+\d+/im.test(instructionText), dockerRel, "Dockerfile exposes a port.");

    if (!/\bHEALTHCHECK\b/im.test(instructionText)) {
      warn(dockerRel, "Dockerfile has no HEALTHCHECK instruction.");
    }

    for (const instruction of instructions.filter((line) => /^COPY\s+/i.test(line))) {
      for (const source of getCopySources(instruction)) {
        const normalizedSource = source.replace(/\\/g, "/").replace(/^\.\//, "");
        if (!normalizedSource || normalizedSource.startsWith("--") || normalizedSource.startsWith("http")) continue;
        const exists = normalizedSource.includes("*") || normalizedSource.includes("?")
          ? pathMatchesPattern(normalizedSource)
          : existsSync(join(rootDir, normalizedSource));
        check(exists, dockerRel, `COPY source exists: ${normalizedSource}`);
      }
    }

    const filterMatches = [...instructionText.matchAll(/pnpm\s+--filter\s+(@[^\s]+)\s+build/g)];
    for (const match of filterMatches) {
      check(workspaceByName.has(match[1]), dockerRel, `PNPM build filter resolves to a workspace package: ${match[1]}`);
    }

    if (/\|\|\s*true/.test(instructionText)) {
      fail(dockerRel, "Dockerfile masks command failures with `|| true`.");
    }

    const serviceMatch = dockerRel.match(/^services\/([^/]+)\/Dockerfile$/);
    if (serviceMatch) {
      const serviceName = serviceMatch[1];
      const packagePath = join(rootDir, "services", serviceName, "package.json");
      if (existsSync(packagePath) && /^FROM\s+python:/im.test(instructionText)) {
        fail(dockerRel, "Service has a Node package.json but Dockerfile uses a Python base image.");
      }
      if (/uvicorn/.test(instructionText) && new RegExp(`services\\.${serviceName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.`).test(instructionText)) {
        fail(dockerRel, "Uvicorn module path contains the hyphenated service directory name, which is not a valid Python module path.");
      }
    }
  }
}

function auditHostingConfig() {
  const render = readText("render.yaml");
  check(Boolean(render), "render.yaml", "Render Blueprint file is present.");
  if (render) {
    check(/services\s*:/m.test(render), "render.yaml", "Render services section is present.");
    check(/runtime\s*:\s*docker/m.test(render), "render.yaml", "Render backend uses Docker runtime.");
    check(/dockerfilePath\s*:\s*\.\/backend\/Dockerfile/m.test(render), "render.yaml", "Render dockerfilePath points to backend/Dockerfile.");
    check(/dockerContext\s*:\s*\./m.test(render), "render.yaml", "Render Docker context is the repository root.");
    check(/healthCheckPath\s*:\s*\/healthz/m.test(render), "render.yaml", "Render health check path is /healthz.");
    check(/key\s*:\s*PORT/m.test(render), "render.yaml", "Render PORT env var is declared.");
    check(/key\s*:\s*HOST/m.test(render), "render.yaml", "Render HOST env var is declared.");
    check(/key\s*:\s*NODE_BACKEND_DB_PATH/m.test(render), "render.yaml", "Render backend DB path env var is declared.");
  }

  check(existsSync(join(rootDir, ".dockerignore")), ".dockerignore", "Docker ignore file exists.");
  check(existsSync(join(rootDir, "docs/HOSTING.md")), "docs/HOSTING.md", "Hosting documentation exists.");
}

function printStaticSummary() {
  const byKind = [
    ["fail", "Failures"],
    ["warn", "Warnings"]
  ];

  for (const [kind, title] of byKind) {
    if (!results[kind].length) continue;
    console.log(`\n${title}:`);
    for (const item of results[kind]) {
      console.log(`- [${item.scope}] ${item.message}`);
    }
  }

  console.log(`\nStatic checks: ${results.pass.length} passed, ${results.warn.length} warnings, ${results.fail.length} failures.`);
}

function printFinalSummary() {
  console.log("\nAudit summary:");
  console.log(`- Passed: ${results.pass.length}`);
  console.log(`- Warnings: ${results.warn.length}`);
  console.log(`- Failures: ${results.fail.length}`);
}

console.log("Loksewa backend/services automation audit");
console.log(`Root: ${rootDir}`);
console.log(`Node: ${process.version}`);

const { workspacePackages } = auditRootWorkspace();
auditBackend();
auditWorkspacePackages(workspacePackages);
auditServicePackages();
auditDockerfiles(workspacePackages);
auditHostingConfig();
printStaticSummary();

if (options.staticOnly) {
  console.log("\nCommand checks skipped by --static-only.");
} else {
  if (!options.skipBackendSmoke) {
    runCommand("backend smoke test", "npm", ["--prefix", "backend", "test"]);
  } else {
    skipCommand("backend smoke test", "Skipped by flag.");
  }

  const servicePackages = workspacePackages
    .filter(isBackendServicePackage)
    .filter((item) => item.packageJson?.name)
    .map((item) => item.packageJson.name);

  if (!options.skipServiceBuilds) {
    for (const packageName of servicePackages) {
      runCommand(`build ${packageName}`, "pnpm", ["--filter", packageName, "build"]);
    }
  } else {
    skipCommand("service builds", "Skipped by flag.");
  }

  if (!options.skipServiceTypechecks) {
    for (const item of workspacePackages.filter(isBackendServicePackage)) {
      const packageName = item.packageJson?.name;
      if (!packageName) continue;
      if (item.packageJson.scripts?.typecheck) {
        runCommand(`typecheck ${packageName}`, "pnpm", ["--filter", packageName, "typecheck"]);
      } else {
        warn(rel(item.dir), "No typecheck script; build command is the enforced TypeScript check.");
      }
    }
  } else {
    skipCommand("service typechecks", "Skipped by flag.");
  }
}

printFinalSummary();
process.exitCode = results.fail.length > 0 ? 1 : 0;
