#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const scriptDirectory = resolve(fileURLToPath(new URL(".", import.meta.url)));
const repoRoot = resolve(scriptDirectory, "..");
const envFile = resolve(repoRoot, ".env");
const runtimeConfigFile = resolve(repoRoot, "public", "config.json");
const defaultConfigFile = resolve(repoRoot, "public", "default.config.json");

const readJson = (filePath) => {
  const raw = readFileSync(filePath, "utf8");
  return JSON.parse(raw);
};

const parseRootFqdn = (payload) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const rootFqdn = payload.rootFqdn;

  if (typeof rootFqdn !== "string") {
    return null;
  }

  const trimmed = rootFqdn.trim();
  return trimmed || null;
};

const loadRootFqdn = () => {
  try {
    const runtimeConfig = readJson(runtimeConfigFile);
    const runtimeRootFqdn = parseRootFqdn(runtimeConfig);

    if (runtimeRootFqdn) {
      return runtimeRootFqdn;
    }
  } catch {
    // Fall back to default config.
  }

  const defaultConfig = readJson(defaultConfigFile);
  const defaultRootFqdn = parseRootFqdn(defaultConfig);

  if (!defaultRootFqdn) {
    throw new Error(`Could not resolve rootFqdn from public/config.json or public/default.config.json.`);
  }

  return defaultRootFqdn;
};

const rootFqdn = loadRootFqdn();
writeFileSync(envFile, `ROOT_FQDN=${rootFqdn}\n`, { encoding: "utf8" });
console.log(`Wrote .env with ROOT_FQDN=${rootFqdn}`);
