import tl = require('azure-pipelines-task-lib/task');
var fs = require('fs');
var path = require('path');
var coverityInstallation = require("./coverity_installation");
var coverityApi = require("./coverity_api");
var coverityRunner = require("./coverity_runner");

async function run() {
    try {
        const server: string = tl.getEndpointUrl('coverityService', true);

        const username: string = tl.getEndpointAuthorizationParameter('coverityService', 'username', true);
        const password: string = tl.getEndpointAuthorizationParameter('coverityService', 'password', true);

        const url = server + "/ws/v9/configurationservice?wsdl";
        
        const projectName = tl.getInput('projectName', true);
        const streamName = tl.getInput('streamName', true);

        console.log("Starting coverity, connecting to:" + server);

        var connected = await coverityApi.connectAsync(url, username, password);
        if (!connected || !(coverityApi.client)) {
            tl.setResult(tl.TaskResult.Failed, 'Could not connect to coverity server.');
            return;
        } else {
            console.log("Connected!");
        }

        var project = await coverityApi.findProjectAsync(projectName);
        if (project) {
            console.log("Found project.");
        } else {
            tl.setResult(tl.TaskResult.Failed, 'Given project could not be found on coverity server.');
            return;
        }

        fs.writeFileSync("project.json", JSON.stringify(project));

        var stream = await coverityApi.findStreamAsync(project, streamName);
        if (stream) {
            console.log("Found stream.");
        } else {
            tl.setResult(tl.TaskResult.Failed, 'Given stream could not be found on the given project.');
            return;
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
            return;
        }

        var buildDirectory = tl.getPathInput('cwd', true, false); // tl.getVariable("Agent.BuildDirectory");
        var idir: string = path.join(buildDirectory, "idir");

        var cov_build = ["cov-build", "--dir", idir];
        var cov_analyze = ["cov-analyze", "--dir", idir];
        var cov_commit = ["cov-commit-defects", "--dir", idir, "--url", server, "--stream", streamName];

        var toolName = cov_build[0];
        console.log("Searching for coverity tool: " + toolName);

        var tool = coverityInstallation.findCoverityTool(bin, toolName);
        if (tool){
            console.log("Found tool: " + tool);
        } else {
            tl.setResult(tl.TaskResult.Failed, 'Coverity tool ' + toolName + ' could not be found.');
            return;
        }

        var covBuild = await coverityRunner.runCoverityTool(tool, buildDirectory, cov_build.slice(1), []);

       console.log("Finished: " + covBuild);
        
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