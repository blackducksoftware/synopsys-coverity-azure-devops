"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var tl = require("azure-pipelines-task-lib/task");
var fs = require('fs');
var path = require('path');
var coverityInstallation = require("./coverity_installation");
var coverityApi = require("./coverity_api");
var coverityRunner = require("./coverity_runner");
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var server, username, password, url, projectName, streamName, connected, project, stream, bin, buildDirectory, idir, cov_build, cov_analyze, cov_commit, toolName, tool, covBuild, err_1, text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    server = tl.getEndpointUrl('coverityService', true);
                    username = tl.getEndpointAuthorizationParameter('coverityService', 'username', true);
                    password = tl.getEndpointAuthorizationParameter('coverityService', 'password', true);
                    url = server + "/ws/v9/configurationservice?wsdl";
                    projectName = tl.getInput('projectName', true);
                    streamName = tl.getInput('streamName', true);
                    console.log("Starting coverity, connecting to:" + server);
                    return [4 /*yield*/, coverityApi.connectAsync(url, username, password)];
                case 1:
                    connected = _a.sent();
                    if (!connected || !(coverityApi.client)) {
                        tl.setResult(tl.TaskResult.Failed, 'Could not connect to coverity server.');
                        return [2 /*return*/];
                    }
                    else {
                        console.log("Connected!");
                    }
                    return [4 /*yield*/, coverityApi.findProjectAsync(projectName)];
                case 2:
                    project = _a.sent();
                    if (project) {
                        console.log("Found project.");
                    }
                    else {
                        tl.setResult(tl.TaskResult.Failed, 'Given project could not be found on coverity server.');
                        return [2 /*return*/];
                    }
                    fs.writeFileSync("project.json", JSON.stringify(project));
                    return [4 /*yield*/, coverityApi.findStreamAsync(project, streamName)];
                case 3:
                    stream = _a.sent();
                    if (stream) {
                        console.log("Found stream.");
                    }
                    else {
                        tl.setResult(tl.TaskResult.Failed, 'Given stream could not be found on the given project.');
                        return [2 /*return*/];
                    }
                    console.log("Project: " + project.id.name);
                    console.log("Stream: " + stream.id.name);
                    console.log("Succesfully communicated with coverity server.");
                    console.log("Searching for coverity installation.");
                    bin = coverityInstallation.findCoverityBin();
                    if (bin) {
                        console.log("Found coverity bin: " + bin);
                    }
                    else {
                        tl.setResult(tl.TaskResult.Failed, 'Coverity installation could not be found.');
                        return [2 /*return*/];
                    }
                    buildDirectory = tl.getPathInput('cwd', true, false);
                    idir = path.join(buildDirectory, "idir");
                    cov_build = ["cov-build", "--dir", idir];
                    cov_analyze = ["cov-analyze", "--dir", idir];
                    cov_commit = ["cov-commit-defects", "--dir", idir, "--url", server, "--stream", streamName];
                    toolName = cov_build[0];
                    console.log("Searching for coverity tool: " + toolName);
                    tool = coverityInstallation.findCoverityTool(bin, toolName);
                    if (tool) {
                        console.log("Found tool: " + tool);
                    }
                    else {
                        tl.setResult(tl.TaskResult.Failed, 'Coverity tool ' + toolName + ' could not be found.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, coverityRunner.runCoverityTool(tool, buildDirectory, cov_build.slice(1), [])];
                case 4:
                    covBuild = _a.sent();
                    console.log("Finished: " + covBuild);
                    return [2 /*return*/];
                case 5:
                    err_1 = _a.sent();
                    if (err_1.message) {
                        text = err_1.message;
                    }
                    else {
                        text = err_1.toString();
                    }
                    console.log("An error occured: " + text);
                    tl.setResult(tl.TaskResult.Failed, text);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
run();
/*
        setEnvironmentVariable(CoverityToolEnvironmentVariable.USER, coverityInstance.getCoverityUsername().orElse(StringUtils.EMPTY));
        setEnvironmentVariable(CoverityToolEnvironmentVariable.PASSPHRASE, coverityInstance.getCoverityPassword().orElse(StringUtils.EMPTY));
        setEnvironmentVariable(JenkinsCoverityEnvironmentVariable.COVERITY_URL, coverityInstance.getUrl());
        setEnvironmentVariable(JenkinsCoverityEnvironmentVariable.COVERITY_PROJECT, projectName);
        setEnvironmentVariable(JenkinsCoverityEnvironmentVariable.COVERITY_STREAM, streamName);
        setEnvironmentVariable(JenkinsCoverityEnvironmentVariable.COVERITY_VIEW, viewName);
        setEnvironmentVariable(JenkinsCoverityEnvironmentVariable.CHANGE_SET, computeChangeSet(changeLogSets, configureChangeSetPatterns));
        setEnvironmentVariable(JenkinsCoverityEnvironmentVariable.COVERITY_INTERMEDIATE_DIRECTORY, computeIntermediateDirectory(getEnvVars()));

            private String computeIntermediateDirectory(final EnvVars envVars) {
        final String workspace = envVars.get("WORKSPACE");
        final Path workspacePath = Paths.get(workspace);
        final Path intermediateDirectoryPath = workspacePath.resolve("idir");
        return intermediateDirectoryPath.toString();
    }

    private String computeChangeSet(final List<ChangeLogSet<?>> changeLogSets, final ConfigureChangeSetPatterns configureChangeSetPatterns) {
        final ChangeSetFilter changeSetFilter;
        if (configureChangeSetPatterns == null) {
            changeSetFilter = ChangeSetFilter.createAcceptAllFilter();
        } else {
            changeSetFilter = configureChangeSetPatterns.createChangeSetFilter();
        }

        return changeLogSets.stream()
                   .filter(changeLogSet -> !changeLogSet.isEmptySet())
                   .flatMap(this::toEntries)
                   .peek(this::logEntry)
                   .flatMap(this::toAffectedFiles)
                   .filter(changeSetFilter::shouldInclude)
                   .map(ChangeLogSet.AffectedFile::getPath)
                   .collect(Collectors.joining(" "));
    }

*/ 
