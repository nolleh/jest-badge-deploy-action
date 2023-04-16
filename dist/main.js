"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const util_1 = require("./util");
const constants_1 = require("./constants");
const gh_deploy_1 = require("./gh-deploy");
const badge_1 = require("./badge");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let status = constants_1.Status.RUNNING;
        try {
            (0, core_1.info)("coverage-badge-action");
            (0, core_1.info)("configuration...");
            const settings = Object.assign(Object.assign({}, constants_1.action), { 
                // Set the default branch for Node configurations
                branch: !(0, util_1.isNullOrUndefined)(constants_1.action.branch) ? constants_1.action.branch : "gh-pages" });
            (0, core_1.info)("⚙️g #1. generateBadge...");
            yield (0, badge_1.generateBadge)(settings);
            (0, core_1.info)("⚙️  #2. github deploy...");
            status = yield (0, gh_deploy_1.githubDeploy)(settings);
        }
        catch (e) {
            status = constants_1.Status.FAILED;
            (0, core_1.setFailed)((0, util_1.extractErrorMessage)(e));
        }
        finally {
            if (status === constants_1.Status.FAILED) {
                (0, core_1.notice)("Deployment failed! ❌");
            }
            else if (status === constants_1.Status.SUCCESS) {
                (0, core_1.info)("Completed deployment successfully! ✅");
            }
            else {
                (0, core_1.info)("There is nothing to commit. Exiting early… 📭");
            }
            (0, core_1.exportVariable)("deployment_status", status);
            (0, core_1.setOutput)("deployment-status", status);
        }
    });
}
run();
