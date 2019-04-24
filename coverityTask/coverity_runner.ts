import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import trm = require('azure-pipelines-task-lib/toolrunner');

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
    
    var code: number = await tool.exec();

    return code;
}

module.exports = {
    runCoverityTool: runCoverityTool
}