"use strict";
exports.__esModule = true;
//Move the below to their own area.
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
