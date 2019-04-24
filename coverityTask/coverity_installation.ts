var Env = require("./environment_variables");
var fs = require('fs');
var path = require('path');
var compareVersions = require('compare-versions');

const minimumVersion = "8.0.0.0"
const versionPrefix = "externalVersion=";

function findCoverityBin(): string|null {
    console.log("Getting COVERITY_TOOL_HOME from the environment.");
    var coverityToolHome = Env.getRequired("COVERITY_TOOL_HOME", "The coverity tool home must be set.");
    console.log("Found: " + coverityToolHome);
    var exists = fs.existsSync(coverityToolHome);
    console.log("Exists: " + exists);
    var versionFile = path.join(coverityToolHome, "VERSION");
    var versionXmlFile = path.join(coverityToolHome, "VERSION.xml");
    var versionFilesExist = fs.existsSync(versionFile) && fs.existsSync(versionXmlFile);
    console.log("Version Files Exists: " + versionFilesExist);
    var coverityVersion = findCoverityVersion(versionFile);
    console.log("Coverity Version: " + coverityVersion);
    if (compareVersions(coverityVersion, minimumVersion) < 0) {
        //Analysis version %s detected. The minimum supported version is %s
        console.log(`Coverity version '${coverityVersion}' was below the minimum version of '${minimumVersion}'.`)
        return null;
    }
    var binDirectory = path.join(coverityToolHome, "bin");
    var binExists = fs.existsSync(binDirectory);
    console.log("Bin exists: " + binExists);
    if (!binExists) {
        //bin not found
        console.log("The coverity bin directory did not exist: " + binDirectory);
        return null;
    }
    console.log("Coverity succesfully found.");
    return binDirectory;
}

function findCoverityVersion(versionFile: String): String {
    var lines = fs.readFileSync(versionFile).toString().split("\n");
    var versionLines = lines.map((line: String) => line.trim())
        .filter((line: String) => line.startsWith(versionPrefix))
        .map((line: String) => line.substring(versionPrefix.length));
    if (versionLines.length == 1) {
        return versionLines[0];
    } else {
        throw `Unable to find coverity version from version file.`;
    }
}

function findCoverityTool(bin: string, toolName: string): String|null {
    var files = fs.readdirSync(bin);
    var tool = null;
    files.forEach((element:string) => {
        var name = path.parse(element).name;
        if (name == toolName){
            tool = path.join(bin, element);
        }
    });
    return tool;
}

module.exports = {
    findCoverityBin: findCoverityBin,
    findCoverityTool: findCoverityTool
}