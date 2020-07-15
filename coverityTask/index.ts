import tl = require('azure-pipelines-task-lib/task');
import CoverityTypes = require("./coverity_types");
import { fail } from 'assert';
var fs = require('fs');
var path = require('path');
var coverityInstallation = require("./coverity_installation");
var coveritySoapApi = require("./coverity_api_soap");
var coverityRestApi = require("./coverity_api_rest");
var coverityRunner = require("./coverity_runner");

async function run() {
    try {
        console.log("Starting Coverity for ADO.");

        console.log("Finding Coverity bin.");
        var bin = await find_coverity_bin();
        console.log("Reading ADO inputs.");
        var inputs = await find_inputs();
        console.log("Verifying ADO inputs.");
        var verified_inputs = await verify_inputs(inputs);

        console.log("Using working directory: " + inputs.workingDir);
        console.log("Using intermediate directory: " + inputs.idir);
   
        console.log(`Setting up the environment for coverity commands.`);
        var env: CoverityTypes.CoverityEnvironment = {
            coverityToolHome: bin, 
            username: inputs.username,
            password: inputs.password,
            url: inputs.server,
            project: inputs.projectName,
            stream: inputs.streamName,
            idir: inputs.idir,
            view: inputs.viewName
        };
        var variables = await coverityRunner.environmentToVariables(env);

        console.log(`Will run (${inputs.commands.length}) coverity commands.`);
        for (var command of inputs.commands) {
            console.log(`Substituting (${command.commandMultiArgs.length}) arguments with coverity variables if applicable.`);
            for (var i = 0; i < command.commandMultiArgs.length; i++){
                command.commandMultiArgs[i] = await coverityRunner.replaceArg(variables, command.commandMultiArgs[i]);
            }
            console.log(`Running coverity command.`);
            var commandRun = await coverityRunner.runCoverityCommand(bin, inputs.workingDir, command);
        }
        console.log("Finished runnning commands.");

        if (verified_inputs.issueId && inputs.issueStatus){
            console.log("Will check for defects.");
            await set_task_status_from_defects(verified_inputs.coverityRestApi, verified_inputs.project.id.name, verified_inputs.issueId, inputs.issueStatus);
        } else {
            console.log("Will not check for defects.");
        }

        console.log("Finished Coverity for ADO.");
    }
    catch (err) {
        var text;
        if (err.message){
            text = err.message;
        } else {
            text = err.toString();
        }
        console.log("An error occured: " + text);
        tl.setResult(tl.TaskResult.Failed, text);
    }
}

interface CoverityInputs {
    server: string,
    username: string,
    password: string,
    projectName: string, 
    streamName: string,
    commands: CoverityTypes.CoverityCommand[],
    allowUntrusted: boolean,
    workingDir?: string,
    idir?: string,
    viewName?: string,
    issueStatus?: string
}

interface CoverityVerifiedInputs {
    coveritySoapApi: CoverityTypes.CoveritySoapApi,
    coverityRestApi: CoverityTypes.CoverityRestApi,

    project: CoverityTypes.Project, 
    stream: CoverityTypes.Stream,
    issueId?: string
}

interface ProjectAndStream {
    project: CoverityTypes.Project, 
    stream: CoverityTypes.Stream,
}

async function find_coverity_bin(): Promise<string> {
    var bin = coverityInstallation.findCoverityBin();
    if (!bin){
        fail_and_throw("Unable to locate coverity bin.");
    }
    return bin;   
}

async function verify_inputs(raw_input: CoverityInputs): Promise<CoverityVerifiedInputs> {
    var soapClient = await connect_soap(raw_input.server, raw_input.username, raw_input.password, raw_input.allowUntrusted);
    var restClient = await connect_rest(raw_input.server, raw_input.username, raw_input.password, raw_input.allowUntrusted);

    var project_and_stream = await find_project_and_stream(soapClient, raw_input.projectName, raw_input.streamName);
    var issue_view_id;
    if (raw_input.viewName){
        issue_view_id = await find_issue_view_id(restClient, raw_input.viewName);
    }

    return {
        coveritySoapApi: soapClient,
        coverityRestApi: restClient,
        project: project_and_stream.project,
        stream: project_and_stream.stream,
        issueId: issue_view_id
    };

}

async function find_inputs(): Promise<CoverityInputs> {
    console.log("Reading coverity service input.");
    var coverityService = tl.getInput('coverityService', true);

    //The following boolean is OPTIONAL, not required, unlike all the other booleans.
    const server: string = tl.getEndpointUrl(coverityService, false);
    const username: string = tl.getEndpointAuthorizationParameter(coverityService, 'username', false);
    const password: string = tl.getEndpointAuthorizationParameter(coverityService, 'password', false);

    const runType = tl.getInput('coverityRunType', true);
   
    const projectName = tl.getInput('projectName', true);
    const streamName = tl.getInput('streamName', true);

    console.log("Determining build and issue inputs.");
    var viewName = undefined;
    var issueStatus = undefined;
    const checkIssues = tl.getBoolInput("checkIssues", true);
    if (checkIssues){
        viewName = tl.getInput("issueView", true);
        issueStatus = tl.getInput("issueStatus", true);
    }


    console.log("Parsing command inputs.");
    
    var buildDirectory: (string|undefined) = undefined;
    var idir: (string|undefined) = undefined;
    var commands = new Array<CoverityTypes.CoverityCommand>();

    buildDirectory = tl.getPathInput('coverityBuildDirectory', true, true);
    idir = path.join(buildDirectory!, "idir");
    if (runType == "buildanalyzecommit"){
        const analysisType = tl.getInput('coverityAnalysisType', true);
        const buildCommand = tl.getInput("buildCommand", false);
            
        console.log("Parsing build analyze and commit inputs.");
        var cov_build = new CoverityTypes.CoverityCommand("cov-build", ["--dir", idir!], array_with_value_or_empty(tl.getInput("covBuildArgs", false)));
        cov_build.commandMultiArgs.push(buildCommand);
        commands.push(cov_build);
        if (analysisType == "full"){
            var cov_middle = new CoverityTypes.CoverityCommand("cov-analyze", ["--dir", idir!], array_with_value_or_empty(tl.getInput("covAnalyzeArgs", false)));
            commands.push(cov_middle);
        }else if (analysisType == "incremental"){
            var cov_middle = new CoverityTypes.CoverityCommand("cov-run-desktop", ["--dir", idir!, "--url", server, "--stream", streamName], array_with_value_or_empty(tl.getInput("covDesktopArgs", false)));
            commands.push(cov_middle);
        } else {
            fail_and_throw('Unkown coverity analysis type: ' + runType);
        }
        var cov_commit = new CoverityTypes.CoverityCommand("cov-commit-defects", ["--dir", idir!, "--url", server, "--stream", streamName], array_with_value_or_empty(tl.getInput("covCommitArgs", false)));
        commands.push(cov_commit);
    } else if (runType == "custom"){
        console.log("Parsing custom command inputs.");
        const customCommands = tl.getInput('customCoverityCommands', true);
        var rawCommands = customCommands.split("\n");
        rawCommands.forEach((command: string) => {
            var parts = command.split(' ');
            var toolName = parts[0];
            var args = parts.slice(1);
            console.log(`Parsed command with tool '${toolName}' and custom args of length ${args.length}`);
            commands.push(new CoverityTypes.CoverityCommand(toolName, [], args));
        });
    } else {
        fail_and_throw('Unkown coverity run type: ' + runType);
    }

    var allowUntrusted: boolean = tl.getBoolInput("allowUntrusted", true);

    return {
        server: server,
        username: username,
        password: password,
        projectName: projectName, 
        streamName: streamName,
        workingDir: buildDirectory,
        idir: idir,
        commands: commands,
        viewName: viewName,
        issueStatus: issueStatus,
        allowUntrusted: allowUntrusted
    };
}

function array_with_value_or_empty(value:string|null|undefined){
    if (value){
        return [value];
    } else {
        return [];
    }
}

function fail_and_throw(msg:string) {
    tl.setResult(tl.TaskResult.Failed, msg);
    throw msg;
}

async function connect_soap(server:string, username:string, password:string, allowUntrusted: boolean) : Promise<CoverityTypes.CoveritySoapApi> {
    console.log("Testing connection over soap.");

    var connected = await coveritySoapApi.connectAsync(server, username, password, allowUntrusted);
    if (!connected || !(coveritySoapApi.client)) {
        fail_and_throw('Could not connect to coverity server.');
    } else {
        console.log("Connected!");
    }

    return coveritySoapApi;
}

async function connect_rest(server:string, username:string, password:string, allowUntrusted: boolean) : Promise<CoverityTypes.CoverityRestApi>{
    console.log("Testing connection over rest.");
    var connected = await coverityRestApi.connectAsync(server, username, password, allowUntrusted);
    if (!connected || !(coverityRestApi.auth)) {
        fail_and_throw('Could not connect to coverity server to find issues.');
    } else {
        console.log("Connected!");
    }
    return coverityRestApi;
}

async function find_project_and_stream(coveritySoapApi: CoverityTypes.CoveritySoapApi, projectName: string, streamName: string): Promise<ProjectAndStream> {
    console.log("Finding project and stream.");
    var project = await coveritySoapApi.findProjectAsync(projectName);
    if (project) {
        console.log("Found project.");
    } else {
        fail_and_throw('Given project could not be found on coverity server.');
    }

    var stream = await coveritySoapApi.findStreamAsync(project, streamName);
    if (stream) {
        console.log("Found stream.");
    } else {
        fail_and_throw('Given stream could not be found on the given project.');
    }

    console.log("Project: " + project.id.name);
    console.log("Stream: " + stream.id.name);
    console.log("Succesfully found project and stream.");

    return {
        project: project,
        stream: stream
    };
}

async function find_issue_view_id(coverityRestApi: CoverityTypes.CoverityRestApi, viewName:string): Promise<string> {
    console.log("Checking views.");
    var views = await coverityRestApi.findViews();
    var possible = new Array<string>();
    var viewId:any = null;
    console.log(`Found (${views.views.length}) views.`);
    console.log(`Looking for view: ${viewName}`);
    views.views.forEach((element:any) => {
        if (element.type && element.type == "issues"){
            if (element.name == viewName){
                viewId = element.id;
            } else {
                possible.push(element.name);
            }
        }
    });

    if (viewId) {
        console.log("Found view: " + viewId);
    } else {
        fail_and_throw('Given issue view could not be found on coverity server, possibilities are: ' + possible.join(','));
    }
    return viewId;
}

async function set_task_status_from_defects(coverityRestApi:CoverityTypes.CoverityRestApi, projectId: string, viewId: string, issueStatus: string) {
    console.log("Determining task status from defects.");
    var defects = await coverityRestApi.findDefects(viewId, projectId);
    var rows = defects.viewContentsV1.totalRows;
    console.log("Defects found: " + rows);
    if (rows > 0){
        console.log("Setting status from defects.");
        if (issueStatus == "success"){
            console.log("Desired status was success. Will not change status.");
        } else if (issueStatus == "failure"){
            console.log("Desired status failure. Failing the task.");
            tl.setResult(tl.TaskResult.Failed, 'Task markes as FAILURE, defects were found.');
        } else if (issueStatus == "unstable"){
            console.log("Desired status unstable. Marking as succeeded with issues.");
            tl.setResult(tl.TaskResult.SucceededWithIssues, 'Task marked as UNSTABLE, defects were found.');
        } else {
            console.log("Unknown status build type.");
            tl.setResult(tl.TaskResult.Failed, 'Unknown build status type: ' + issueStatus);
        }
    } else {
        console.log("Will not set status, no defects were found.");
    }
}

run();