import { test as base, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type IstanbulCoverage = Record<string, unknown>;
type IstanbulFileCoverage = {
  inputSourceMap?: {
    sources?: string[];
  };
  path?: string;
};

declare global {
  interface Window {
    __coverage__?: IstanbulCoverage;
  }
}

const coverageDirectory = path.join(process.cwd(), 'testing/output/.nyc_frontend');

const createCoverageFileName = (titlePath: string[]) => {
  const readableName = titlePath
    .join(' ')
    .replaceAll(/[^a-zA-Z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '')
    .toLowerCase();

  return `${readableName || 'e2e-coverage'}-${process.pid}.json`;
};

const remapContainerCoveragePaths = (coverage: IstanbulCoverage) => {
  const remappedCoverage: IstanbulCoverage = {};

  for (const [filePath, fileCoverage] of Object.entries(coverage)) {
    const remappedPath = filePath.replace(/^\/app\//, `${process.cwd()}/`);
    const typedCoverage = fileCoverage as IstanbulFileCoverage;

    remappedCoverage[remappedPath] = {
      ...typedCoverage,
      inputSourceMap: typedCoverage.inputSourceMap
        ? {
            ...typedCoverage.inputSourceMap,
            sources: typedCoverage.inputSourceMap.sources?.map((sourcePath) => sourcePath.replace(/^\/app\//, `${process.cwd()}/`)),
          }
        : undefined,
      path: remappedPath,
    };
  }

  return remappedCoverage;
};

/**
 * Playwright test fixture that saves browser-generated Istanbul coverage after each e2e test.
 */
export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    await use(page);

    const coverage = await page.evaluate(() => (globalThis as Window & typeof globalThis).__coverage__).catch(() => undefined);

    if (!coverage || Object.keys(coverage).length === 0) {
      return;
    }

    await mkdir(coverageDirectory, { recursive: true });
    await writeFile(path.join(coverageDirectory, createCoverageFileName(testInfo.titlePath)), JSON.stringify(remapContainerCoveragePaths(coverage)), 'utf8');
  },
});

export { expect };
