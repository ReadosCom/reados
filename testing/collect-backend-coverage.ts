import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type CoverageMap = Record<string, unknown>;

type BackendTarget = {
  name: string;
  url: string;
};

const backendTargets: BackendTarget[] = [
  { name: `tenant`, url: `http://tenant.reados.localhost/__coverage__` },
  { name: `authentication`, url: `http://authentication.demo.reados.localhost/__coverage__` },
  { name: `accounting`, url: `http://accounting.demo.reados.localhost/__coverage__` },
  { name: `core`, url: `http://core.demo.reados.localhost/__coverage__` },
];

const outputDirectory = path.join(process.cwd(), `testing/output/.nyc_backend`);

const remapContainerCoveragePaths = (coverage: CoverageMap): CoverageMap => {
  const remappedCoverage: CoverageMap = {};

  for (const [filePath, fileCoverage] of Object.entries(coverage)) {
    const remappedPath = filePath.replace(/^\/app\//, `${process.cwd()}/`);
    remappedCoverage[remappedPath] = {
      ...(fileCoverage as Record<string, unknown>),
      path: remappedPath,
    };
  }

  return remappedCoverage;
};

const fetchCoverage = async ({ name, url }: BackendTarget) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { name, status: `skipped`, reason: `HTTP ${response.status}` } as const;
    }

    const coverage = (await response.json()) as CoverageMap;
    if (!coverage || Object.keys(coverage).length === 0) {
      return { name, status: `skipped`, reason: `empty coverage payload` } as const;
    }

    const outputFilePath = path.join(outputDirectory, `${name}.json`);
    await writeFile(outputFilePath, JSON.stringify(remapContainerCoveragePaths(coverage)), `utf8`);
    return { name, status: `written`, outputFilePath } as const;
  } catch (error) {
    return { name, status: `skipped`, reason: error instanceof Error ? error.message : String(error) } as const;
  }
};

await mkdir(outputDirectory, { recursive: true });

const results = await Promise.all(backendTargets.map(fetchCoverage));
for (const result of results) {
  if (result.status === `written`) {
    console.log(`[coverage:backend] ${result.name}: wrote ${result.outputFilePath}`);
    continue;
  }

  console.warn(`[coverage:backend] ${result.name}: ${result.reason}`);
}
