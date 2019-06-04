import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import trm = require('azure-pipelines-task-lib/toolrunner');
import CoverityTypes = require("./coverity_types");
var coverityInstallation = require("./coverity_installation");

//Require a library that then imports the sub libraries.

async function environmentToVariables(covEnv: CoverityTypes.CoverityEnvironment): Promise<any> {
    var env:any = {
        "PATH+COVERITYTOOLBIN": covEnv.coverityToolHome,
        "COV_USER": covEnv.username,
        "COVERITY_PASSPHRASE": covEnv.password,
        "COV_URL": covEnv.url,
        "COV_PROJECT": covEnv.project,
        "COV_STREAM": covEnv.stream,
        "COV_VIEW": covEnv.view,
        "COV_DIR": covEnv.idir
    };

    var set = [];
    for (var e in env){
        set.push(e);
        process.env[e] = env[e];
    }
    console.log("Updated the following environment variables: " + set.join(","));

    return env;
}

async function replaceArg(env: any, arg: string): Promise<string> {
    for (var e in env){
        var key = "$" + e;
        var value = env[e];
        arg = arg.split(key).join(value);
    }
    return arg;
}


async function runCoverityCommand(bin: string, cwd: string, command: CoverityTypes.CoverityCommand) {
    console.log("Searching for coverity tool: " + command.tool);

    var tool = coverityInstallation.findCoverityTool(bin, command.tool);
    if (tool) {
        console.log("Found tool: " + tool);
    } else {
        throw 'Coverity tool ' + command.tool + ' could not be found.';
    }

    var result = await runCoverityTool(tool, cwd, command.commandArgs, command.commandMultiArgs);
    return result;
}

async function runCoverityTool(toolPath: string, cwd: string, toolArgs: string[], toolMultiArgs: string[]):Promise<number> {
    console.log("Building coverty command: " + toolPath);

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
    
    var code: number = await tool.exec();

    console.log("Finished command, return code: " + code);
    return code;
}

module.exports = {
    runCoverityTool: runCoverityTool,
    runCoverityCommand: runCoverityCommand,
    environmentToVariables: environmentToVariables,
    replaceArg: replaceArg
}