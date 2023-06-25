import { info } from "@actions/core";
import { ActionInterface } from "../constants";
import { pathExists, readJson } from "fs-extra";
import {
  generateBadges,
  CoverageSummary,
  FileCoverageTotal,
} from "node-jest-badges";

interface JestCoverage {
  total?: CoverageSummary;
}

const isUndefined = (element?: FileCoverageTotal) => element?.pct === undefined;

export const doBadgesExist = async (outputPath: string): Promise<boolean> => {
  const files = [
    "coverage-branches.svg",
    "coverage-functions.svg",
    "coverage-jest coverage.svg",
    "coverage-lines.svg",
    "coverage-statements.svg",
  ];

  const exist = await Promise.all(
    files.map((file) => pathExists(`${outputPath}/${file}`))
  );

  return exist.every((el) => el === true);
};

export async function generateBadge(settings: ActionInterface) {
  const isReportAvailable = await isJestCoverageReportAvailable(settings);

  if (!isReportAvailable) {
    throw new Error(
      "Coverage report is missing. Did you forget to run tests or to add `json-summary` to coverageReporters in jest config?"
    );
  }
  const summaryPathInput = settings.coverageSummaryPath;
  const summaryPath = summaryPathInput === "" ? undefined : summaryPathInput;

  const outputPath = settings.folder;
  // this must be checked before generating badges (duh!)
  await doBadgesExist(outputPath);

  info(
    `🔶 Generating badges from ${summaryPath ? summaryPath : "default coverage summary path"
    }`
  );

  await generateBadges(summaryPath, outputPath);
}

async function isJestCoverageReportAvailable(
  settings: ActionInterface
): Promise<boolean> {
  const coverageExists = await pathExists(settings.coverageSummaryPath);
  if (!coverageExists) {
    return false;
  }

  const data: JestCoverage = await readJson(settings.coverageSummaryPath);
  if (!data || !data.total) {
    return false;
  }

  if (
    isUndefined(data.total.branches) ||
    isUndefined(data.total.functions) ||
    isUndefined(data.total.lines) ||
    isUndefined(data.total.statements)
  ) {
    return false;
  }

  return true;
}
