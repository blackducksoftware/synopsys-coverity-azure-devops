import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import trm = require('azure-pipelines-task-lib/toolrunner');
import CoverityTypes = require("./coverity_types");
var coverityInstallation = require("./coverity_installation");


async function runCoverityCommand(bin: string, cwd: string, command: CoverityTypes.CoverityCommand, covEnv: CoverityTypes.CoverityEnvironment) {
    var toolName = command.tool; //FilenameUtils.removeExtension(arguments.get(0).toLowerCase(Locale.ENGLISH));

    console.log("Searching for coverity tool: " + toolName);

    var tool = coverityInstallation.findCoverityTool(bin, toolName);
    if (tool){
        console.log("Found tool: " + tool);
    } else {
        throw 'Coverity tool ' + toolName + ' could not be found.';
    }

    var result = await runCoverityTool(tool, cwd, command.commandArgs, command.commandMultiArgs, covEnv);
    return result;
}

async function runCoverityTool(toolPath: string, cwd: string, toolArgs: string[], toolMultiArgs: string[], covEnv: CoverityTypes.CoverityEnvironment):Promise<number> {
    console.log("Preparing coverity command for tool: " + toolPath);

    var tool = tl.tool(toolPath);

    tl.mkdirP(cwd);
    tl.cd(cwd);

    toolArgs.forEach(toolArg => {
        tool.arg(toolArg);
    });

    toolMultiArgs.forEach(toolArg => {
        tool.line(toolArg);
    });
    
    console.log("Executing command.");

    var env = {
        "PATH+COVERITYTOOLBIN": covEnv.coverityToolHome,
        "COV_USER": covEnv.username,
        "COVERITY_PASSPHRASE": covEnv.password,
        "COV_URL": covEnv.url,
        "COV_PROJECT": covEnv.project,
        "COV_STREAM": covEnv.stream,
        "COV_VIEW": covEnv.view,
        "COV_DIR": covEnv.idir,
        "CHANGE_SET": covEnv.change_set
    };

    var options: any = { env: env };
    var code: number = await tool.exec(options);

    console.log("Finished command, return code: " + code);
    return code;
}

module.exports = {
    runCoverityTool: runCoverityTool,
    runCoverityCommand: runCoverityCommand
}