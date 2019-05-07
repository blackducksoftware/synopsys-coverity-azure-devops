"use strict";
exports.__esModule = true;
var CoverityCommand = /** @class */ (function () {
    function CoverityCommand(tool, commandArgs, commandMultiArgs) {
        this.commandArgs = [];
        this.commandMultiArgs = [];
        this.tool = tool;
        this.commandArgs = commandArgs;
        this.commandMultiArgs = commandMultiArgs;
    }
    return CoverityCommand;
}());
exports.CoverityCommand = CoverityCommand;
