import { exportVariable, info } from "@actions/core";
import { appendFileSync, existsSync } from "fs";
import { execFileSync, execSync } from "child_process";
import { mkdirP } from "@actions/io";
import { ActionInterface, RequiredActionParameters } from "./constants";

import path from "path";

export function extractErrorMessage<T>(error: T) {
  return error instanceof Error
    ? error.message
    : typeof error == "string"
    ? error
    : JSON.stringify(error);
}

export function isNullOrUndefined(
  value: unknown
): value is undefined | null | "" {
  return typeof value === "undefined" || value === null || value === "";
}

export async function ssh(action: ActionInterface): Promise<void> {
  try {
    if (typeof action.sshKey === "string") {
      const sshDirectory = `${process.env["HOME"]}/.ssh`;
      const sshKnownHostsDirectory = `${sshDirectory}/known_hosts`;

      // SSH fingerprints provided by GitHub: https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/githubs-ssh-key-fingerprints
      const sshGitHubKnownHostRsa = `\n${action.hostname} ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==\n`;
      const sshGitHubKnownHostDss = `\n${action.hostname} ssh-dss AAAAB3NzaC1kc3MAAACBANGFW2P9xlGU3zWrymJgI/lKo//ZW2WfVtmbsUZJ5uyKArtlQOT2+WRhcg4979aFxgKdcsqAYW3/LS1T2km3jYW/vr4Uzn+dXWODVk5VlUiZ1HFOHf6s6ITcZvjvdbp6ZbpM+DuJT7Bw+h5Fx8Qt8I16oCZYmAPJRtu46o9C2zk1AAAAFQC4gdFGcSbp5Gr0Wd5Ay/jtcldMewAAAIATTgn4sY4Nem/FQE+XJlyUQptPWMem5fwOcWtSXiTKaaN0lkk2p2snz+EJvAGXGq9dTSWHyLJSM2W6ZdQDqWJ1k+cL8CARAqL+UMwF84CR0m3hj+wtVGD/J4G5kW2DBAf4/bqzP4469lT+dF2FRQ2L9JKXrCWcnhMtJUvua8dvnwAAAIB6C4nQfAA7x8oLta6tT+oCk2WQcydNsyugE8vLrHlogoWEicla6cWPk7oXSspbzUcfkjN3Qa6e74PhRkc7JdSdAlFzU3m7LMkXo1MHgkqNX8glxWNVqBSc0YRdbFdTkL0C6gtpklilhvuHQCdbgB3LBAikcRkDp+FCVkUgPC/7Rw==\n`;

      info(`Configuring SSH client… 🔑`);

      await mkdirP(sshDirectory);

      appendFileSync(sshKnownHostsDirectory, sshGitHubKnownHostRsa);
      appendFileSync(sshKnownHostsDirectory, sshGitHubKnownHostDss);

      // Initializes SSH agent.
      const agentOutput = execFileSync("ssh-agent").toString().split("\n");

      agentOutput.map((line) => {
        const exportableVariables =
          /^(SSH_AUTH_SOCK|SSH_AGENT_PID)=(.*); export \1/.exec(line);

        if (exportableVariables && exportableVariables.length) {
          exportVariable(exportableVariables[1], exportableVariables[2]);
        }
      });

      // Adds the SSH key to the agent.
      action.sshKey.split(/(?=-----BEGIN)/).map(async (line) => {
        execSync("ssh-add -", { input: `${line.trim()}\n` });
      });

      execSync("ssh-add -l");
    }
  } catch (e) {
    throw new Error(
      `The ssh client configuration encountered an error: ${suppressSensitiveInformation(
        extractErrorMessage(e),
        action
      )} ❌`
    );
  }
}

/* Generates a token type used for the action. */
export function generateTokenType(action: ActionInterface): string {
  return action.sshKey ? "SSH Deploy Key" : action.token ? "Deploy Token" : "…";
}

/* Generates a the repository path used to make the commits. */
export function generateRepositoryPath(action: ActionInterface): string {
  return action.sshKey
    ? `git@${action.hostname}:${action.repositoryName}`
    : `https://${`x-access-token:${action.token}`}@${action.hostname}/${
        action.repositoryName
      }.git`;
}

/* Genetate absolute folder path by the provided folder name */
export function generateFolderPath(action: ActionInterface): string {
  const folderName = action["folder"];
  return path.isAbsolute(folderName)
    ? folderName
    : folderName.startsWith("~")
    ? folderName.replace("~", process.env.HOME as string)
    : path.join(action.workspace, folderName);
};

export function hasRequiredParameters<K extends keyof RequiredActionParameters>(
  action: ActionInterface,
  params: K[]
): boolean {
  const nonNullParams = params.filter(
    (param) => !isNullOrUndefined(action[param])
  );
  return Boolean(nonNullParams.length);
};

/* Verifies the action has the required parameters to run, otherwise throw an error. */
export function checkParameters(action: ActionInterface): void {
  if (!hasRequiredParameters(action, ["token", "sshKey"])) {
    throw new Error(
      "No deployment token/method was provided. You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy. If you wish to use an ssh deploy token then you must set SSH to true."
    );
  }

  if (!hasRequiredParameters(action, ["branch"])) {
    throw new Error("Branch is required.");
  }

  if (!hasRequiredParameters(action, ["folder"])) {
    throw new Error("You must provide the action with a folder to deploy.");
  }

  if (!existsSync(action.folderPath as string)) {
    throw new Error(
      `The directory you're trying to deploy named ${action.folderPath} doesn't exist. Please double check the path and any prerequisite build scripts and try again. ❗`
    );
  }
};

export function suppressSensitiveInformation(
  str: string,
  action: ActionInterface
): string {
  let value = str;

  const orderedByLength = (
    [action.token, action.repositoryPath].filter(Boolean) as string[]
  ).sort((a, b) => b.length - a.length);

  for (const find of orderedByLength) {
    value = replaceAll(value, find, "***");
  }

  return value;
}

function replaceAll(input: string, find: string, replace: string): string {
  return input.split(find).join(replace);
}

/**
 * Strips the protocol from a provided URL.
 */
export function stripProtocolFromUrl(url: string): string {
  return url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split("/")[0];
}
