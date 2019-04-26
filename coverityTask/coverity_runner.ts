import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import trm = require('azure-pipelines-task-lib/toolrunner');
var coverityInstallation = require("./coverity_installation");

async function runCoverityCommand(bin: string, cwd: string, commandArgs: string[], commandMultiArgs: string[]) {
    var toolName = commandArgs[0];
    var remainingArgs = commandArgs.slice(1);

    console.log("Searching for coverity tool: " + toolName);

    var tool = coverityInstallation.findCoverityTool(bin, toolName);
    if (tool){
        console.log("Found tool: " + tool);
    } else {
        throw 'Coverity tool ' + toolName + ' could not be found.';
    }

    var result = await runCoverityTool(tool, cwd, remainingArgs, commandMultiArgs);
    return result;
}

async function runCoverityTool(toolPath: string, cwd: string, toolArgs: string[], toolMultiArgs: string[]):Promise<number> {
    var tool: trm.ToolRunner = tl.tool(toolPath);

    tl.mkdirP(cwd);
    tl.cd(cwd);

    toolArgs.forEach(toolArg => {
        tool.arg(toolArg);
    });

    toolMultiArgs.forEach(toolArg => {
        tool.line(toolArg);
    });
    
    console.log("Running coverity command.");

    var code: number = await tool.exec();

    console.log("Finished running coverity task: " + code);
    return code;
}

module.exports = {
    runCoverityTool: runCoverityTool,
    runCoverityCommand: runCoverityCommand
}