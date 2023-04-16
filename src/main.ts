import {
  exportVariable,
  info,
  notice,
  setFailed,
  setOutput,
} from "@actions/core";
import { extractErrorMessage, isNullOrUndefined } from "./util";
import { action, ActionInterface, Status } from "./constants";
import { githubDeploy } from "./gh-deploy";
import { generateBadge } from "./badge";

async function run() {
  let status = Status.RUNNING;
  try {
    info("coverage-badge-action");
    info("configuration...");

    const settings: ActionInterface = {
      ...action,
      // Set the default branch for Node configurations
      branch: !isNullOrUndefined(action.branch) ? action.branch : "gh-pages",
    };

    info("⚙️g #1. generateBadge...");
    await generateBadge(settings);

    info("⚙️  #2. github deploy...");
    status = await githubDeploy(settings);
  } catch (e) {
    status = Status.FAILED;
    setFailed(extractErrorMessage(e));
  } finally {
    if (status === Status.FAILED) {
      notice("Deployment failed! ❌");
    } else if (status === Status.SUCCESS) {
      info("Completed deployment successfully! ✅");
    } else {
      info("There is nothing to commit. Exiting early… 📭");
    }

    exportVariable("deployment_status", status);
    setOutput("deployment-status", status);
  }
}

run();
