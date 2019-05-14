import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import trm = require('azure-pipelines-task-lib/toolrunner');
import CoverityTypes = require("./coverity_types");
var coverityInstallation = require("./coverity_installation");


async function runCoverityCommand(bin: string, cwd: string, command: CoverityTypes.CoverityCommand) {
    var toolName = command.tool; //FilenameUtils.removeExtension(arguments.get(0).toLowerCase(Locale.ENGLISH));

    console.log("Searching for coverity tool: " + toolName);

    var tool = coverityInstallation.findCoverityTool(bin, toolName);
    if (tool){
        console.log("Found tool: " + tool);
    } else {
        throw 'Coverity tool ' + toolName + ' could not be found.';
    }

    var result = await runCoverityTool(tool, cwd, command.commandArgs, command.commandMultiArgs);
    return result;
}

async function runCoverityTool(toolPath: string, cwd: string, toolArgs: string[], toolMultiArgs: string[]):Promise<number> {
    var tool = tl.tool(toolPath);

    tl.mkdirP(cwd);
    tl.cd(cwd);

    toolArgs.forEach(toolArg => {
        tool.arg(toolArg);
    });

    toolMultiArgs.forEach(toolArg => {
        tool.line(toolArg);
    });
    
    console.log("Running coverity command.");
    console.log(cwd)
    console.log(toolPath)
    console.log(toolArgs)
    console.log(toolMultiArgs)
    var code: number = await tool.exec();

    console.log("Finished running coverity task: " + code);
    return code;
}

module.exports = {
    runCoverityTool: runCoverityTool,
    runCoverityCommand: runCoverityCommand
}