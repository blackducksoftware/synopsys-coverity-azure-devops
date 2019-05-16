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

        console.log("Preparing to run Coverity commands.");
        console.log("Using working directory: " + inputs.workingDir);
        console.log("Using intermediate directory: " + inputs.idir);
   
        var env: CoverityTypes.CoverityEnvironment = {
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

        await run_commands(bin, inputs.workingDir, inputs.commands, env);

        console.log("Finished runnning commands.");

        if (verified_inputs.issueId){
            console.log("Preparing to check for defects.");
            await set_task_status_from_defects(verified_inputs.coverityRestApi, verified_inputs.project.id.name, verified_inputs.issueId);
        } else {
            console.log("Will not check for defects.");
        }

        console.log("OVERALL STATUS: SUCCESS");
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
    workingDir: string,
    idir: string,
    commands: CoverityTypes.CoverityCommand[],
    viewName?: string
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
    var soapClient = await connect_soap(raw_input.server, raw_input.username, raw_input.password);
    var restClient = await connect_rest(raw_input.server, raw_input.username, raw_input.password);

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
    var coverityService = tl.getInput('coverityService', true);
    const server: string = tl.getEndpointUrl(coverityService, false);

    const username: string = tl.getEndpointAuthorizationParameter(coverityService, 'username', false);
    const password: string = tl.getEndpointAuthorizationParameter(coverityService, 'password', false);

    const runType = tl.getInput('coverityRunType', true);
    const analysisType = tl.getInput('coverityAnalysisType', true);

    const customCommands = tl.getInput('customCoverityCommands', true);
    
    const projectName = tl.getInput('projectName', true);
    const streamName = tl.getInput('streamName', true);

    const viewName = tl.getInput("issueView", false);
    
    const buildCommand = tl.getInput("buildCommand", false);
    const buildDirectory = tl.getPathInput('coverityBuildDirectory', true, true);
    const idir: string = path.join(buildDirectory, "idir");

    var commands = new Array<CoverityTypes.CoverityCommand>();
    if (runType == "buildanalyzecommit"){
        var cov_build = new CoverityTypes.CoverityCommand("cov-build", ["--dir", idir], array_with_value_or_empty(tl.getInput("covBuildArgs", false)));
        cov_build.commandMultiArgs.push(buildCommand);
        commands.push(cov_build);
        if (analysisType == "full"){
            var cov_middle = new CoverityTypes.CoverityCommand("cov-analyze", ["--dir", idir], array_with_value_or_empty(tl.getInput("covAnalyzeArgs", false)));
            commands.push(cov_middle);
        }else if (analysisType == "incremental"){
            var cov_middle = new CoverityTypes.CoverityCommand("cov-run-desktop", ["--dir", idir, "--url", server, "--stream", streamName], array_with_value_or_empty(tl.getInput("covDesktopArgs", false)));
            commands.push(cov_middle);
        } else {
            fail_and_throw('Unkown coverity analysis type: ' + runType);
        }
        var cov_commit = new CoverityTypes.CoverityCommand("cov-commit-defects", ["--dir", idir, "--url", server, "--stream", streamName], array_with_value_or_empty(tl.getInput("covCommitArgs", false)));
        commands.push(cov_commit);
    } else if (runType == "custom"){
        var rawCommands = customCommands.split("\n");
        rawCommands.forEach(command => {
            var toolName = command.split(' ')[0];
            commands.push(new CoverityTypes.CoverityCommand(toolName, [], [command]));
        });
    } else {
        fail_and_throw('Unkown coverity run type: ' + runType);
    }

    return {
        server: server,
        username: username,
        password: password,
        projectName: projectName, 
        streamName: streamName,
        workingDir: buildDirectory,
        idir: idir,
        commands: commands,
        viewName: viewName
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

async function connect_soap(server:string, username:string, password:string) : Promise<CoverityTypes.CoveritySoapApi> {
    console.log("Communicating over soap to:" + server);

    var connected = await coveritySoapApi.connectAsync(server, username, password);
    if (!connected || !(coveritySoapApi.client)) {
        fail_and_throw('Could not connect to coverity server.');
    } else {
        console.log("Connected!");
    }

    return coveritySoapApi;
}

async function connect_rest(server:string, username:string, password:string) : Promise<CoverityTypes.CoverityRestApi>{
    console.log("Communicating over rest to:" + server);
    var connected = await coverityRestApi.connectAsync(server, username, password);
    if (!connected || !(coverityRestApi.auth)) {
        fail_and_throw('Could not connect to coverity server to find issues.');
    } else {
        console.log("Connected!");
    }
    return coverityRestApi;
}

async function find_project_and_stream(coveritySoapApi: CoverityTypes.CoveritySoapApi, projectName: string, streamName: string): Promise<ProjectAndStream> {
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
    console.log("Discovered views: " + views.views.length);
    console.log("Looking for view: " + viewName);
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

async function set_task_status_from_defects(coverityRestApi:CoverityTypes.CoverityRestApi, projectId: string, viewId: string) {
    console.log("Loading view.");
    var defects = await coverityRestApi.findDefects(viewId, projectId);
    console.log("Defects found: " + defects.viewContentsV1.totalRows);
    if (defects.totalRows > 0){
        var issueStatus = tl.getInput("issueStatus", true);
        if (issueStatus == "success"){
            return null;
        } else if (issueStatus == "failure"){
            tl.setResult(tl.TaskResult.Failed, 'Task markes as FAILURE, defects were found.');
            return null;
        } else if (issueStatus == "unstable"){
            tl.setResult(tl.TaskResult.SucceededWithIssues, 'Task marked as UNSTABLE, defects were found.');
            return null;                
        } else {
            tl.setResult(tl.TaskResult.Failed, 'Unknown build status type: ' + issueStatus);
            return null;
        }
    }
}

async function run_commands(bin:string, buildDirectory:string, commands:Array<CoverityTypes.CoverityCommand>, env: CoverityTypes.CoverityEnvironment) {
    console.log("Will run coverity tools:" + commands.length);
    for (var command of commands) {
        console.log("Running coverity tool:" + command.tool);
        try {
            var commandRun = await coverityRunner.runCoverityCommand(bin, buildDirectory, command, env);
        } catch (e){
            console.log("Failed to run coverity tool.");
        }
        console.log("Finished running coverity tool.");
    }
}

run();