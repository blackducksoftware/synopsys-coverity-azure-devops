import tl = require('azure-pipelines-task-lib/task');
import CoverityTypes = require("./coverity_types");
var fs = require('fs');
var path = require('path');
var coverityInstallation = require("./coverity_installation");
var coveritySoapApi = require("./coverity_api_soap");
var coverityRestApi = require("./coverity_api_rest");
var coverityRunner = require("./coverity_runner");

async function run() {
    try {
        const server: string = tl.getEndpointUrl('coverityService', true);

        const username: string = tl.getEndpointAuthorizationParameter('coverityService', 'username', true);
        const password: string = tl.getEndpointAuthorizationParameter('coverityService', 'password', true);
    
        var result = await connect(server, username, password);

        if (result){
            var args = await find_extra_args();

            var buildDirectory = tl.getPathInput('cwd', true, false); // tl.getVariable("Agent.BuildDirectory");
            var idir: string = path.join(buildDirectory, "idir");
     
            var commands = await find_commands(result.server, idir, result.streamName);
            
            run_commands(result.coverityBin, buildDirectory, commands, args);

            await check_issues(server, username, password, result.projectKey);

            console.log("OVERALL STATUS: SUCCESS");
        }
        return;
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

interface ConnectResult {
    server: string,
    projectKey: string, 
    streamName: string,
    viewId?: string
    coverityBin:string
}

async function check_issues(server: string, username: string, password: string, projectId: string) {
    var viewName = tl.getInput("issueView", false);
    if (viewName){
        var connected = await coverityRestApi.connectAsync(server, username, password);
        if (!connected || !(coverityRestApi.auth)) {
            tl.setResult(tl.TaskResult.Failed, 'Could not connect to coverity server to find issues.');
            return null;
        } else {
            console.log("Connected!");
        }
    
        console.log("Checking views.");
        var views = await coverityRestApi.findViews();
        var possible = new Array<string>();
        var viewId:any = null;
        console.log("Foud views: " + views.views.length);
        views.views.forEach((element:any) => {
            console.log(element);
            if (element.type && element.type == "issues"){
                if (element.name == viewName){
                    viewId = element.id;
                } else {
                    possible.push(element.name);
                }
            }
        });

        if (viewId) {
            console.log("Found issue view: " + viewId);
        } else {
            console.log(possible);
            tl.setResult(tl.TaskResult.Failed, 'Given issue view could not be found on coverity server, possibilities are: ' + possible.join(','));
            return null;
        }
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
}

async function find_extra_args(){
    return {
        "cov-build": tl.getInput("covBuildArgs", false),
        "cov-analyze": tl.getInput("covAnalyzeArgs", false),
        "cov-commit-defects": tl.getInput("covCommitArgs", false),
        "cov-run-desktop": tl.getInput("covDesktopArgs", false),
    };
}

async function run_commands(bin:string, buildDirectory:string, commands:Array<CoverityTypes.CoverityCommand>, extraArgs:any) {
    for (var command of commands) {
        var extra = extraArgs[command.tool];
        if (extra){
            command.commandMultiArgs.push(extra);
        }
        var commandRun = await coverityRunner.runCoverityCommand(bin, buildDirectory, command);
    }
}

async function find_commands(server:string, idir:string, streamName:string):Promise<Array<CoverityTypes.CoverityCommand>> {
    var runType = tl.getInput('coverityRunType', true);
    if (runType == "buildanalyzecommit"){
        var analysisType = tl.getInput('coverityAnalysisType', true);

        var cov_middle;
        if (analysisType == "full"){
            cov_middle = new CoverityTypes.CoverityCommand("cov-analyze", ["--dir", idir], []);
        }else if (analysisType == "incremental"){
            cov_middle = new CoverityTypes.CoverityCommand("cov-run-desktop", ["--dir", idir, "--url", server, "--stream", streamName], []);
        } else {
            tl.setResult(tl.TaskResult.Failed, 'Unkown coverity run type: ' + runType);
            return [];
        }
        var cov_build = new CoverityTypes.CoverityCommand("cov-build", ["--dir", idir], []);
        var cov_commit = new CoverityTypes.CoverityCommand("cov-commit-defects", ["--dir", idir, "--url", server, "--stream", streamName], []);
        return [cov_build, cov_middle, cov_commit];
    } else if (runType == "custom"){
        var customCommands = tl.getInput('customCoverityCommands', true);
        var rawCommands = customCommands.split("\n");
        var commands = new Array<CoverityTypes.CoverityCommand>();
        rawCommands.forEach(command => {
            var toolName = command.split(' ')[0];
            commands.push(new CoverityTypes.CoverityCommand(toolName, [], [command]));
        });
        return commands;
    } else {
        tl.setResult(tl.TaskResult.Failed, 'Unkown coverity run type: ' + runType);
        return [];
    }
}

async function connect(server: string, username: string, password: string): Promise<ConnectResult|null> {
    
    const projectName = tl.getInput('projectName', true);
    const streamName = tl.getInput('streamName', true);

    console.log("Starting coverity, connecting to:" + server);

    var connected = await coveritySoapApi.connectAsync(server, username, password);
    if (!connected || !(coveritySoapApi.client)) {
        tl.setResult(tl.TaskResult.Failed, 'Could not connect to coverity server.');
        return null;
    } else {
        console.log("Connected!");
    }

    var project = await coveritySoapApi.findProjectAsync(projectName);
    if (project) {
        console.log("Found project.");
    } else {
        tl.setResult(tl.TaskResult.Failed, 'Given project could not be found on coverity server.');
        return null;
    }

    fs.writeFileSync("project.json", JSON.stringify(project));

    var stream = await coveritySoapApi.findStreamAsync(project, streamName);
    if (stream) {
        console.log("Found stream.");
    } else {
        tl.setResult(tl.TaskResult.Failed, 'Given stream could not be found on the given project.');
        return null;
    }

    console.log("Project: " + project.id.name);
    console.log("Stream: " + stream.id.name);
    console.log("Succesfully communicated with coverity server.");

    console.log("Searching for coverity installation.");
    var bin = coverityInstallation.findCoverityBin();
    if (bin){
        console.log("Found coverity bin: " + bin);
    } else {
        tl.setResult(tl.TaskResult.Failed, 'Coverity installation could not be found.');
        return null;
    }

    var result: ConnectResult = {
        server: server,
        projectKey: project.projectKey, 
        streamName: streamName,
        coverityBin: bin
    };

    return result;
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