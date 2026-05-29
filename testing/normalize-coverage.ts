import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import coverageLib, { type CoverageMapData } from "istanbul-lib-coverage";
import path from "node:path";

type CoverageMap = CoverageMapData;
type CoverageFile = {
  inputSourceMap?: {
    sources?: string[];
  };
  path?: string;
};

const coverageDirectories = [path.join(process.cwd(), "testing/output/.nyc_frontend"), path.join(process.cwd(), "testing/output/.nyc_backend")];
const mergedCoverageDirectory = path.join(process.cwd(), "testing/output/.nyc_merged");

const remapPath = (filePath: string) => filePath.replace(/^\/app\//, `${process.cwd()}/`);

const isCoverageMap = (value: unknown): value is CoverageMap => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).some((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return false;
    }

    return `statementMap` in entry || `path` in entry;
  });
};

const remapCoverageMap = (coverageMap: CoverageMap) => {
  const remappedCoverageMap: CoverageMap = {};

  for (const [filePath, fileCoverage] of Object.entries(coverageMap)) {
    const remappedPath = remapPath(filePath);
    const typedCoverage = fileCoverage as CoverageFile;

    remappedCoverageMap[remappedPath] = {
      ...typedCoverage,
      inputSourceMap: typedCoverage.inputSourceMap
        ? {
            ...typedCoverage.inputSourceMap,
            sources: typedCoverage.inputSourceMap.sources?.map(remapPath),
          }
        : undefined,
      path: remappedPath,
    } as unknown as CoverageMap[string];
  }

  return remappedCoverageMap;
};

const readCoverageFile = async (filePath: string) => {
  const fileContents = await readFile(filePath, "utf8");
  const parsedContents = JSON.parse(fileContents) as unknown;

  if (!isCoverageMap(parsedContents)) {
    return null;
  }

  return remapCoverageMap(parsedContents);
};

const walk = async (directoryPath: string): Promise<string[]> => {
  const directoryEntries = await readdir(directoryPath, { withFileTypes: true });
  const files = await Promise.all(
    directoryEntries.map(async (directoryEntry) => {
      const entryPath = path.join(directoryPath, directoryEntry.name);

      if (directoryEntry.isDirectory()) {
        return walk(entryPath);
      }

      if (directoryEntry.isFile() && entryPath.endsWith(".json")) {
        return [entryPath];
      }

      return [];
    }),
  );

  return files.flat();
};

const coverageFiles = (
  await Promise.all(
    coverageDirectories.map(async (coverageDirectory) => {
      try {
        const coverageDirectoryStats = await stat(coverageDirectory);

        if (!coverageDirectoryStats.isDirectory()) {
          return [];
        }

        return walk(coverageDirectory);
      } catch {
        return [];
      }
    }),
  )
).flat();

const mergedCoverageMap = coverageLib.createCoverageMap({});
const coverageMaps = await Promise.all(coverageFiles.map(readCoverageFile));

for (const coverageMap of coverageMaps) {
  if (!coverageMap) {
    continue;
  }

  mergedCoverageMap.merge(coverageMap);
}

await mkdir(mergedCoverageDirectory, { recursive: true });
await writeFile(path.join(mergedCoverageDirectory, "coverage.json"), JSON.stringify(mergedCoverageMap.toJSON()), "utf8");
