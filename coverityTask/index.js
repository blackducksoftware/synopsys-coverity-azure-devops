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
var CoverityTypes = require("./coverity_types");
var fs = require('fs');
var path = require('path');
var coverityInstallation = require("./coverity_installation");
var coveritySoapApi = require("./coverity_api_soap");
var coverityRestApi = require("./coverity_api_rest");
var coverityRunner = require("./coverity_runner");
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var coverityService, server, username, password, result, args, buildDirectory, idir, commands, err_1, text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    console.log("Starting Coverity for ADO.");
                    coverityService = tl.getInput('coverityService', true);
                    server = tl.getEndpointUrl(coverityService, false);
                    username = tl.getEndpointAuthorizationParameter(coverityService, 'username', false);
                    password = tl.getEndpointAuthorizationParameter(coverityService, 'password', false);
                    console.log("Connecting to Coverity.");
                    return [4 /*yield*/, connect(server, username, password)];
                case 1:
                    result = _a.sent();
                    if (!result) return [3 /*break*/, 5];
                    console.log("Preparing to run Coverity commands.");
                    return [4 /*yield*/, find_extra_args()];
                case 2:
                    args = _a.sent();
                    buildDirectory = tl.getPathInput('coverityBuildDirectory', true, true);
                    idir = path.join(buildDirectory, "idir");
                    return [4 /*yield*/, find_commands(result.server, idir, result.streamName)];
                case 3:
                    commands = _a.sent();
                    run_commands(result.coverityBin, buildDirectory, commands, args);
                    console.log("Preparing to check for issues.");
                    return [4 /*yield*/, check_issues(server, username, password, result.projectKey)];
                case 4:
                    _a.sent();
                    console.log("OVERALL STATUS: SUCCESS");
                    _a.label = 5;
                case 5: return [2 /*return*/];
                case 6:
                    err_1 = _a.sent();
                    if (err_1.message) {
                        text = err_1.message;
                    }
                    else {
                        text = err_1.toString();
                    }
                    console.log("An error occured: " + text);
                    tl.setResult(tl.TaskResult.Failed, text);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function check_issues(server, username, password, projectId) {
    return __awaiter(this, void 0, void 0, function () {
        var viewName, connected, views, possible, viewId, defects, issueStatus;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    viewName = tl.getInput("issueView", false);
                    if (!viewName) return [3 /*break*/, 4];
                    return [4 /*yield*/, coverityRestApi.connectAsync(server, username, password)];
                case 1:
                    connected = _a.sent();
                    if (!connected || !(coverityRestApi.auth)) {
                        tl.setResult(tl.TaskResult.Failed, 'Could not connect to coverity server to find issues.');
                        return [2 /*return*/, null];
                    }
                    else {
                        console.log("Connected!");
                    }
                    console.log("Checking views.");
                    return [4 /*yield*/, coverityRestApi.findViews()];
                case 2:
                    views = _a.sent();
                    possible = new Array();
                    viewId = null;
                    console.log("Discovered views: " + views.views.length);
                    console.log("Looking for view: " + viewName);
                    views.views.forEach(function (element) {
                        if (element.type && element.type == "issues") {
                            if (element.name == viewName) {
                                viewId = element.id;
                            }
                            else {
                                possible.push(element.name);
                            }
                        }
                    });
                    if (viewId) {
                        console.log("Found view: " + viewId);
                    }
                    else {
                        console.log(possible);
                        tl.setResult(tl.TaskResult.Failed, 'Given issue view could not be found on coverity server, possibilities are: ' + possible.join(','));
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, coverityRestApi.findDefects(viewId, projectId)];
                case 3:
                    defects = _a.sent();
                    console.log("Defects found: " + defects.viewContentsV1.totalRows);
                    if (defects.totalRows > 0) {
                        issueStatus = tl.getInput("issueStatus", true);
                        if (issueStatus == "success") {
                            return [2 /*return*/, null];
                        }
                        else if (issueStatus == "failure") {
                            tl.setResult(tl.TaskResult.Failed, 'Task markes as FAILURE, defects were found.');
                            return [2 /*return*/, null];
                        }
                        else if (issueStatus == "unstable") {
                            tl.setResult(tl.TaskResult.SucceededWithIssues, 'Task marked as UNSTABLE, defects were found.');
                            return [2 /*return*/, null];
                        }
                        else {
                            tl.setResult(tl.TaskResult.Failed, 'Unknown build status type: ' + issueStatus);
                            return [2 /*return*/, null];
                        }
                    }
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function find_extra_args() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, {
                    "cov-build": tl.getInput("covBuildArgs", false),
                    "cov-analyze": tl.getInput("covAnalyzeArgs", false),
                    "cov-commit-defects": tl.getInput("covCommitArgs", false),
                    "cov-run-desktop": tl.getInput("covDesktopArgs", false)
                }];
        });
    });
}
function run_commands(bin, buildDirectory, commands, extraArgs) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, commands_1, command, extra, commandRun, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Will run coverity commands:" + commands.length);
                    _i = 0, commands_1 = commands;
                    _a.label = 1;
                case 1:
                    if (!(_i < commands_1.length)) return [3 /*break*/, 7];
                    command = commands_1[_i];
                    console.log("Running coverity tool:" + command.tool);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    extra = extraArgs[command.tool];
                    if (extra) {
                        command.commandMultiArgs.push(extra);
                    }
                    return [4 /*yield*/, coverityRunner.runCoverityCommand(bin, buildDirectory, command)];
                case 3:
                    commandRun = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    console.log("Failed to run coverity tool.");
                    return [3 /*break*/, 5];
                case 5:
                    console.log("Finished running coverity tool.");
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function find_commands(server, idir, streamName) {
    return __awaiter(this, void 0, void 0, function () {
        var runType, analysisType, cov_middle, cov_build, cov_commit, customCommands, rawCommands, commands;
        return __generator(this, function (_a) {
            runType = tl.getInput('coverityRunType', true);
            if (runType == "buildanalyzecommit") {
                analysisType = tl.getInput('coverityAnalysisType', true);
                if (analysisType == "full") {
                    cov_middle = new CoverityTypes.CoverityCommand("cov-analyze", ["--dir", idir], []);
                }
                else if (analysisType == "incremental") {
                    cov_middle = new CoverityTypes.CoverityCommand("cov-run-desktop", ["--dir", idir, "--url", server, "--stream", streamName], []);
                }
                else {
                    tl.setResult(tl.TaskResult.Failed, 'Unkown coverity run type: ' + runType);
                    return [2 /*return*/, []];
                }
                cov_build = new CoverityTypes.CoverityCommand("cov-build", ["--dir", idir], []);
                cov_commit = new CoverityTypes.CoverityCommand("cov-commit-defects", ["--dir", idir, "--url", server, "--stream", streamName], []);
                return [2 /*return*/, [cov_build, cov_middle, cov_commit]];
            }
            else if (runType == "custom") {
                customCommands = tl.getInput('customCoverityCommands', true);
                rawCommands = customCommands.split("\n");
                commands = new Array();
                rawCommands.forEach(function (command) {
                    var toolName = command.split(' ')[0];
                    commands.push(new CoverityTypes.CoverityCommand(toolName, [], [command]));
                });
                return [2 /*return*/, commands];
            }
            else {
                tl.setResult(tl.TaskResult.Failed, 'Unkown coverity run type: ' + runType);
                return [2 /*return*/, []];
            }
            return [2 /*return*/];
        });
    });
}
function connect(server, username, password) {
    return __awaiter(this, void 0, void 0, function () {
        var projectName, streamName, connected, project, stream, bin, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    projectName = tl.getInput('projectName', true);
                    streamName = tl.getInput('streamName', true);
                    console.log("Starting coverity, connecting to:" + server);
                    return [4 /*yield*/, coveritySoapApi.connectAsync(server, username, password)];
                case 1:
                    connected = _a.sent();
                    if (!connected || !(coveritySoapApi.client)) {
                        tl.setResult(tl.TaskResult.Failed, 'Could not connect to coverity server.');
                        return [2 /*return*/, null];
                    }
                    else {
                        console.log("Connected!");
                    }
                    return [4 /*yield*/, coveritySoapApi.findProjectAsync(projectName)];
                case 2:
                    project = _a.sent();
                    if (project) {
                        console.log("Found project.");
                    }
                    else {
                        tl.setResult(tl.TaskResult.Failed, 'Given project could not be found on coverity server.');
                        return [2 /*return*/, null];
                    }
                    fs.writeFileSync("project.json", JSON.stringify(project));
                    return [4 /*yield*/, coveritySoapApi.findStreamAsync(project, streamName)];
                case 3:
                    stream = _a.sent();
                    if (stream) {
                        console.log("Found stream.");
                    }
                    else {
                        tl.setResult(tl.TaskResult.Failed, 'Given stream could not be found on the given project.');
                        return [2 /*return*/, null];
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
                        return [2 /*return*/, null];
                    }
                    result = {
                        server: server,
                        projectKey: project.projectKey,
                        streamName: streamName,
                        coverityBin: bin
                    };
                    return [2 /*return*/, result];
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
