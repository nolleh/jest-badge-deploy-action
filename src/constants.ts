import { getInput } from "@actions/core";
import * as github from "@actions/github";
import { stripProtocolFromUrl, isNullOrUndefined } from "./util";

const { pusher, repository } = github.context.payload;
/* Flags to signal different scenarios to test cases */
export enum TestFlag {
  NONE = 0,
  HAS_CHANGED_FILES = 1 << 1, // Assume changes to commit.
  HAS_REMOTE_BRANCH = 1 << 2, // Assume remote repository has existing commits.
  UNABLE_TO_REMOVE_ORIGIN = 1 << 3, // Assume we can't remove origin.
  UNABLE_TO_UNSET_GIT_CONFIG = 1 << 4, // Assume we can't remove previously set git configs.
  HAS_REJECTED_COMMIT = 1 << 5, // Assume commit rejection.
}
/* For more information please refer to the README: https://github.com/JamesIves/github-pages-deploy-action */
export interface ActionInterface {
  coverageSummaryPath: string;

  /** The branch that the action should deploy to. */
  branch: string;
  /** The hostname of which the GitHub Workflow is being run on, ie: github.com */
  hostname?: string;
  /** The git config email. */
  email?: string;
  /** The folder to deploy. */
  folder: string;
  /** The auto generated folder path. */
  folderPath?: string;
  /** Determines test scenarios the action is running in. */
  isTest: TestFlag;
  /** The git config name. */
  name?: string;
  /** The repository path, for example JamesIves/github-pages-deploy-action. */
  repositoryName?: string;
  /** Determines if the action should run in silent mode or not. */
  silent: boolean;
  /** Defines an SSH private key that can be used during deployment. This can also be set to true to use SSH deployment endpoints if you've already configured the SSH client outside of this package. */
  sshKey?: string | boolean | null;
  /** Deployment token. */
  token?: string | null;
  /** The token type, ie ssh/token, this gets automatically generated. */
  tokenType?: string;
  /** The folder where your deployment project lives. */
  workspace: string;
}
/* Required action data that gets initialized when running within the GitHub Actions environment. */
export const action: ActionInterface = {
  coverageSummaryPath: getInput("coverage-summary-path"),
  folder: !isNullOrUndefined(getInput("folder"))
    ? getInput("folder")
    : "badges",

  branch: getInput("branch"),
  hostname: process.env.GITHUB_SERVER_URL
    ? stripProtocolFromUrl(process.env.GITHUB_SERVER_URL)
    : "github.com",
  isTest: TestFlag.NONE,
  email: !isNullOrUndefined(getInput("git-config-email"))
    ? getInput("git-config-email")
    : pusher && pusher.email
    ? pusher.email
    : `${
        process.env.GITHUB_ACTOR || "github-pages-deploy-action"
      }@users.noreply.${
        process.env.GITHUB_SERVER_URL
          ? stripProtocolFromUrl(process.env.GITHUB_SERVER_URL)
          : "github.com"
      }`,
  name: !isNullOrUndefined(getInput("git-config-name"))
    ? getInput("git-config-name")
    : pusher && pusher.name
    ? pusher.name
    : process.env.GITHUB_ACTOR
    ? process.env.GITHUB_ACTOR
    : "GitHub Pages Deploy Action",
  repositoryName: !isNullOrUndefined(getInput("repository-name"))
    ? getInput("repository-name")
    : repository && repository.full_name
    ? repository.full_name
    : process.env.GITHUB_REPOSITORY,
  token: getInput("token"),
  silent: !isNullOrUndefined(getInput("silent"))
    ? getInput("silent").toLowerCase() === "true"
    : false,
  sshKey: isNullOrUndefined(getInput("ssh-key"))
    ? false
    : !isNullOrUndefined(getInput("ssh-key")) &&
      getInput("ssh-key").toLowerCase() === "true"
    ? true
    : getInput("ssh-key"),
  workspace: process.env.GITHUB_WORKSPACE || "",
};

/** Types for the required action parameters. */
export type RequiredActionParameters = Pick<
  ActionInterface,
  "token" | "sshKey" | "branch" | "folder" | "isTest"
>;

/** Status codes for the action. */
export enum Status {
  SUCCESS = "success",
  FAILED = "failed",
  SKIPPED = "skipped",
  RUNNING = "running",
}

/* Excluded files. */
export enum DefaultExcludedFiles {
  CNAME = "CNAME",
  NOJEKYLL = ".nojekyll",
  SSH = ".ssh",
  GIT = ".git",
  GITHUB = ".github",
}
