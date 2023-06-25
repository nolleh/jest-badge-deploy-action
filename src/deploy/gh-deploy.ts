import { ActionInterface, Status } from "../constants";
import {
  ssh,
  generateFolderPath,
  checkParameters,
  generateRepositoryPath,
  generateTokenType,
} from "../util";
import { deploy, init } from "./git";

export async function githubDeploy(settings: ActionInterface): Promise<Status> {
  // Defines the repository/folder paths and token types.
  // Also verifies that the action has all of the required parameters.
  settings.folderPath = generateFolderPath(settings);

  checkParameters(settings);

  settings.repositoryPath = generateRepositoryPath(settings);
  settings.tokenType = generateTokenType(settings);

  if (settings.sshKey) {
    await ssh(settings);
  }

  // Defines the repository/folder paths and token types.
  // Also verifies that the action has all of the required parameters.
  await init(settings);
  return await deploy(settings);
}
