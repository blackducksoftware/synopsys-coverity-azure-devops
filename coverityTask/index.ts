import tl = require('azure-pipelines-task-lib/task');
var fs = require('fs');
var path = require('path');
var coverityInstallation = require("./coverity_installation");
var coverityApi = require("./coverity_api");
var coverityRunner = require("./coverity_runner");

async function run() {
    try {
        
        var result = await connect();

        if (result){
            var args = await find_extra_args();

            var buildDirectory = tl.getPathInput('cwd', true, false); // tl.getVariable("Agent.BuildDirectory");
            var idir: string = path.join(buildDirectory, "idir");
    
            var commands = await find_commands(result.server, idir, result.streamName);
            run_commands(result.coverityBin, buildDirectory, commands, args);

            if (result.viewId){
                check_issues
                
            }
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
        //console.log(err);
    }
}

interface ConnectResult {
    server: string,
    projectKey: string, 
    streamName: string,
    viewId?: string
    coverityBin:string
}

async function check_issues() {
    //defects are over http. 
    //get the views /api/views/v1
    //find the view id 
    //find defects for the view /api/viewContents/issues/v1/<viewId>
    //fail if there are defects

    final int defectSize = getIssueCountForView(projectId, viewId, viewService);
    logger.info(String.format("[Coverity] Found %s issues for project \"%s\" and view \"%s\"", defectSize, resolvedProjectName, resolvedViewName));

}

async function find_extra_args(){
    return {
        "cov-build": tl.getInput("covBuildArgs", false),
        "cov-analyze": tl.getInput("covAnalyzeArgs", false),
        "cov-commit-defects": tl.getInput("covCommitArgs", false),
        "cov-run-desktop": tl.getInput("covDesktopArgs", false),
    };
}

async function run_commands(bin:string, buildDirectory:string, commands:Array<Array<string>>, extraArgs:any) {
    for (var command in commands) {
        var commandRun = await coverityRunner.runCoverityCommand(bin, buildDirectory, command, extraArgs[command[0]]);
    }
}

async function find_commands(server:string, idir:string, streamName:string):Promise<Array<Array<string>>> {
    var runType = tl.getInput('coverityRunType', true);
    if (runType == "buildanalyzecommit"){
        var analysisType = tl.getInput('coverityAnalysisType', true);

        var cov_middle;
        if (analysisType == "full"){
            cov_middle = ["cov-analyze", "--dir", idir];
        }else if (analysisType == "incremental"){
            cov_middle = ["cov-run-desktop", "--dir", idir, "--url", server, "--stream", streamName];
        } else {
            tl.setResult(tl.TaskResult.Failed, 'Unkown coverity run type: ' + runType);
            return [];
        }

        var cov_build = ["cov-build", "--dir", idir];
        var cov_commit = ["cov-commit-defects", "--dir", idir, "--url", server, "--stream", streamName];
        return [cov_build, cov_middle, cov_commit];
    } else if (runType == "custom"){
        return []; //TODO: customCoverityCommands
    } else {
        tl.setResult(tl.TaskResult.Failed, 'Unkown coverity run type: ' + runType);
        return [];
    }
}

async function connect(): Promise<ConnectResult|null> {
    const server: string = tl.getEndpointUrl('coverityService', true);

    const username: string = tl.getEndpointAuthorizationParameter('coverityService', 'username', true);
    const password: string = tl.getEndpointAuthorizationParameter('coverityService', 'password', true);
    
    const projectName = tl.getInput('projectName', true);
    const streamName = tl.getInput('streamName', true);

    console.log("Starting coverity, connecting to:" + server);

    var connected = await coverityApi.connectAsync(server, username, password);
    if (!connected || !(coverityApi.client)) {
        tl.setResult(tl.TaskResult.Failed, 'Could not connect to coverity server.');
        return null;
    } else {
        console.log("Connected!");
    }

    var project = await coverityApi.findProjectAsync(projectName);
    if (project) {
        console.log("Found project.");
    } else {
        tl.setResult(tl.TaskResult.Failed, 'Given project could not be found on coverity server.');
        return null;
    }

    fs.writeFileSync("project.json", JSON.stringify(project));

    var stream = await coverityApi.findStreamAsync(project, streamName);
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