import { ActionInterface, Status } from "./constants";
import { ssh } from "./util";
import { deploy, init } from "./git";
export async function githubDeploy(settings: ActionInterface): Promise<Status> {
  if (settings.sshKey) {
    await ssh(settings);
  }

  await init(settings);
  return await deploy(settings);
}
