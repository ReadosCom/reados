declare module "istanbul-lib-coverage" {
  type FileCoverage = {
    path?: string;
    statementMap?: unknown;
    [key: string]: unknown;
  };

  export type CoverageMapData = Record<string, FileCoverage>;

  export interface CoverageMap {
    merge(other: CoverageMapData | CoverageMap): void;
    toJSON(): CoverageMapData;
  }

  export function createCoverageMap(initialCoverage?: CoverageMapData): CoverageMap;

  const defaultExport: {
    createCoverageMap: typeof createCoverageMap;
  };

  export default defaultExport;
}
