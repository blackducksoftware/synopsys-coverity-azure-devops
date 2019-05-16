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
        var bin, inputs, verified_inputs, env, err_1, text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    console.log("Starting Coverity for ADO.");
                    console.log("Finding Coverity bin.");
                    return [4 /*yield*/, find_coverity_bin()];
                case 1:
                    bin = _a.sent();
                    console.log("Reading ADO inputs.");
                    return [4 /*yield*/, find_inputs()];
                case 2:
                    inputs = _a.sent();
                    console.log("Verifying ADO inputs.");
                    return [4 /*yield*/, verify_inputs(inputs)];
                case 3:
                    verified_inputs = _a.sent();
                    console.log("Preparing to run Coverity commands.");
                    console.log("Using working directory: " + inputs.workingDir);
                    console.log("Using intermediate directory: " + inputs.idir);
                    env = {
                        coverityToolHome: bin,
                        username: inputs.username,
                        password: inputs.password,
                        url: inputs.server,
                        project: inputs.projectName,
                        stream: inputs.streamName,
                        idir: inputs.idir,
                        view: inputs.viewName,
                        change_set: undefined
                    };
                    return [4 /*yield*/, run_commands(bin, inputs.workingDir, inputs.commands, env)];
                case 4:
                    _a.sent();
                    console.log("Finished runnning commands.");
                    if (!verified_inputs.issueId) return [3 /*break*/, 6];
                    console.log("Preparing to check for defects.");
                    return [4 /*yield*/, set_task_status_from_defects(verified_inputs.coverityRestApi, verified_inputs.project.id.name, verified_inputs.issueId)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    console.log("Will not check for defects.");
                    _a.label = 7;
                case 7:
                    console.log("OVERALL STATUS: SUCCESS");
                    return [3 /*break*/, 9];
                case 8:
                    err_1 = _a.sent();
                    if (err_1.message) {
                        text = err_1.message;
                    }
                    else {
                        text = err_1.toString();
                    }
                    console.log("An error occured: " + text);
                    tl.setResult(tl.TaskResult.Failed, text);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function find_coverity_bin() {
    return __awaiter(this, void 0, void 0, function () {
        var bin;
        return __generator(this, function (_a) {
            bin = coverityInstallation.findCoverityBin();
            if (!bin) {
                fail_and_throw("Unable to locate coverity bin.");
            }
            return [2 /*return*/, bin];
        });
    });
}
function verify_inputs(raw_input) {
    return __awaiter(this, void 0, void 0, function () {
        var soapClient, restClient, project_and_stream, issue_view_id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connect_soap(raw_input.server, raw_input.username, raw_input.password)];
                case 1:
                    soapClient = _a.sent();
                    return [4 /*yield*/, connect_rest(raw_input.server, raw_input.username, raw_input.password)];
                case 2:
                    restClient = _a.sent();
                    return [4 /*yield*/, find_project_and_stream(soapClient, raw_input.projectName, raw_input.streamName)];
                case 3:
                    project_and_stream = _a.sent();
                    if (!raw_input.viewName) return [3 /*break*/, 5];
                    return [4 /*yield*/, find_issue_view_id(restClient, raw_input.viewName)];
                case 4:
                    issue_view_id = _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/, {
                        coveritySoapApi: soapClient,
                        coverityRestApi: restClient,
                        project: project_and_stream.project,
                        stream: project_and_stream.stream,
                        issueId: issue_view_id
                    }];
            }
        });
    });
}
function find_inputs() {
    return __awaiter(this, void 0, void 0, function () {
        var coverityService, server, username, password, runType, analysisType, customCommands, projectName, streamName, viewName, buildCommand, buildDirectory, idir, commands, cov_build, cov_middle, cov_middle, cov_commit, rawCommands;
        return __generator(this, function (_a) {
            coverityService = tl.getInput('coverityService', true);
            server = tl.getEndpointUrl(coverityService, false);
            username = tl.getEndpointAuthorizationParameter(coverityService, 'username', false);
            password = tl.getEndpointAuthorizationParameter(coverityService, 'password', false);
            runType = tl.getInput('coverityRunType', true);
            analysisType = tl.getInput('coverityAnalysisType', true);
            customCommands = tl.getInput('customCoverityCommands', true);
            projectName = tl.getInput('projectName', true);
            streamName = tl.getInput('streamName', true);
            viewName = tl.getInput("issueView", false);
            buildCommand = tl.getInput("buildCommand", false);
            buildDirectory = tl.getPathInput('coverityBuildDirectory', true, true);
            idir = path.join(buildDirectory, "idir");
            commands = new Array();
            if (runType == "buildanalyzecommit") {
                cov_build = new CoverityTypes.CoverityCommand("cov-build", ["--dir", idir], array_with_value_or_empty(tl.getInput("covBuildArgs", false)));
                cov_build.commandMultiArgs.push(buildCommand);
                commands.push(cov_build);
                if (analysisType == "full") {
                    cov_middle = new CoverityTypes.CoverityCommand("cov-analyze", ["--dir", idir], array_with_value_or_empty(tl.getInput("covAnalyzeArgs", false)));
                    commands.push(cov_middle);
                }
                else if (analysisType == "incremental") {
                    cov_middle = new CoverityTypes.CoverityCommand("cov-run-desktop", ["--dir", idir, "--url", server, "--stream", streamName], array_with_value_or_empty(tl.getInput("covDesktopArgs", false)));
                    commands.push(cov_middle);
                }
                else {
                    fail_and_throw('Unkown coverity analysis type: ' + runType);
                }
                cov_commit = new CoverityTypes.CoverityCommand("cov-commit-defects", ["--dir", idir, "--url", server, "--stream", streamName], array_with_value_or_empty(tl.getInput("covCommitArgs", false)));
                commands.push(cov_commit);
            }
            else if (runType == "custom") {
                rawCommands = customCommands.split("\n");
                rawCommands.forEach(function (command) {
                    var toolName = command.split(' ')[0];
                    commands.push(new CoverityTypes.CoverityCommand(toolName, [], [command]));
                });
            }
            else {
                fail_and_throw('Unkown coverity run type: ' + runType);
            }
            return [2 /*return*/, {
                    server: server,
                    username: username,
                    password: password,
                    projectName: projectName,
                    streamName: streamName,
                    workingDir: buildDirectory,
                    idir: idir,
                    commands: commands,
                    viewName: viewName
                }];
        });
    });
}
function array_with_value_or_empty(value) {
    if (value) {
        return [value];
    }
    else {
        return [];
    }
}
function fail_and_throw(msg) {
    tl.setResult(tl.TaskResult.Failed, msg);
    throw msg;
}
function connect_soap(server, username, password) {
    return __awaiter(this, void 0, void 0, function () {
        var connected;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Communicating over soap to:" + server);
                    return [4 /*yield*/, coveritySoapApi.connectAsync(server, username, password)];
                case 1:
                    connected = _a.sent();
                    if (!connected || !(coveritySoapApi.client)) {
                        fail_and_throw('Could not connect to coverity server.');
                    }
                    else {
                        console.log("Connected!");
                    }
                    return [2 /*return*/, coveritySoapApi];
            }
        });
    });
}
function connect_rest(server, username, password) {
    return __awaiter(this, void 0, void 0, function () {
        var connected;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Communicating over rest to:" + server);
                    return [4 /*yield*/, coverityRestApi.connectAsync(server, username, password)];
                case 1:
                    connected = _a.sent();
                    if (!connected || !(coverityRestApi.auth)) {
                        fail_and_throw('Could not connect to coverity server to find issues.');
                    }
                    else {
                        console.log("Connected!");
                    }
                    return [2 /*return*/, coverityRestApi];
            }
        });
    });
}
function find_project_and_stream(coveritySoapApi, projectName, streamName) {
    return __awaiter(this, void 0, void 0, function () {
        var project, stream;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, coveritySoapApi.findProjectAsync(projectName)];
                case 1:
                    project = _a.sent();
                    if (project) {
                        console.log("Found project.");
                    }
                    else {
                        fail_and_throw('Given project could not be found on coverity server.');
                    }
                    return [4 /*yield*/, coveritySoapApi.findStreamAsync(project, streamName)];
                case 2:
                    stream = _a.sent();
                    if (stream) {
                        console.log("Found stream.");
                    }
                    else {
                        fail_and_throw('Given stream could not be found on the given project.');
                    }
                    console.log("Project: " + project.id.name);
                    console.log("Stream: " + stream.id.name);
                    console.log("Succesfully found project and stream.");
                    return [2 /*return*/, {
                            project: project,
                            stream: stream
                        }];
            }
        });
    });
}
function find_issue_view_id(coverityRestApi, viewName) {
    return __awaiter(this, void 0, void 0, function () {
        var views, possible, viewId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Checking views.");
                    return [4 /*yield*/, coverityRestApi.findViews()];
                case 1:
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
                        fail_and_throw('Given issue view could not be found on coverity server, possibilities are: ' + possible.join(','));
                    }
                    return [2 /*return*/, viewId];
            }
        });
    });
}
function set_task_status_from_defects(coverityRestApi, projectId, viewId) {
    return __awaiter(this, void 0, void 0, function () {
        var defects, issueStatus;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Loading view.");
                    return [4 /*yield*/, coverityRestApi.findDefects(viewId, projectId)];
                case 1:
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
                    return [2 /*return*/];
            }
        });
    });
}
function run_commands(bin, buildDirectory, commands, env) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, commands_1, command, commandRun, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Will run coverity tools:" + commands.length);
                    _i = 0, commands_1 = commands;
                    _a.label = 1;
                case 1:
                    if (!(_i < commands_1.length)) return [3 /*break*/, 7];
                    command = commands_1[_i];
                    console.log("Running coverity tool:" + command.tool);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, coverityRunner.runCoverityCommand(bin, buildDirectory, command, env)];
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
run();
