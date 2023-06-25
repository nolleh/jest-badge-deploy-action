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
exports.generateBadge = exports.doBadgesExist = void 0;
const core_1 = require("@actions/core");
const fs_extra_1 = require("fs-extra");
const node_jest_badges_1 = require("node-jest-badges");
const isUndefined = (element) => (element === null || element === void 0 ? void 0 : element.pct) === undefined;
const doBadgesExist = (outputPath) => __awaiter(void 0, void 0, void 0, function* () {
    const files = [
        "coverage-branches.svg",
        "coverage-functions.svg",
        "coverage-jest coverage.svg",
        "coverage-lines.svg",
        "coverage-statements.svg",
    ];
    const exist = yield Promise.all(files.map((file) => (0, fs_extra_1.pathExists)(`${outputPath}/${file}`)));
    return exist.every((el) => el === true);
});
exports.doBadgesExist = doBadgesExist;
function generateBadge(settings) {
    return __awaiter(this, void 0, void 0, function* () {
        const isReportAvailable = yield isJestCoverageReportAvailable(settings);
        if (!isReportAvailable) {
            throw new Error("Coverage report is missing. Did you forget to run tests or to add `json-summary` to coverageReporters in jest config?");
        }
        const summaryPathInput = settings.coverageSummaryPath;
        const summaryPath = summaryPathInput === "" ? undefined : summaryPathInput;
        const outputPath = settings.folder;
        // this must be checked before generating badges (duh!)
        yield (0, exports.doBadgesExist)(outputPath);
        (0, core_1.info)(`🔶 Generating badges from ${summaryPath ? summaryPath : "default coverage summary path"}`);
        yield (0, node_jest_badges_1.generateBadges)(summaryPath, outputPath);
    });
}
exports.generateBadge = generateBadge;
function isJestCoverageReportAvailable(settings) {
    return __awaiter(this, void 0, void 0, function* () {
        const coverageExists = yield (0, fs_extra_1.pathExists)(settings.coverageSummaryPath);
        if (!coverageExists) {
            return false;
        }
        const data = yield (0, fs_extra_1.readJson)(settings.coverageSummaryPath);
        if (!data || !data.total) {
            return false;
        }
        if (isUndefined(data.total.branches) ||
            isUndefined(data.total.functions) ||
            isUndefined(data.total.lines) ||
            isUndefined(data.total.statements)) {
            return false;
        }
        return true;
    });
}
