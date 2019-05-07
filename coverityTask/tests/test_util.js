function setServiceInputs(server, username, password) {
    process.env["ENDPOINT_URL_COVERITYSERVICE"] = server;
    process.env["ENDPOINT_AUTH_PARAMETER_COVERITYSERVICE_USERNAME"] = username;
    process.env["ENDPOINT_AUTH_PARAMETER_COVERITYSERVICE_PASSWORD"] = password;
}
function setToolHome(toolHome) {
    process.env["COVERITY_TOOL_HOME"] = toolHome;
}
function mockBaseCommands(bin, cwd, server, streamName) {
    var execs = {};
    mockCommand(execs, bin + "\\cov-build.exe --dir " + cwd + "\\idir", 0, "executed coverity build", "");
    mockCommand(execs, bin + "\\cov-analyze.exe --dir " + cwd + "\\idir", 0, "executed coverity analyze", "");
    mockCommand(execs, bin + "\\cov-commit-defects.exe --dir " + cwd + "\\idir --url " + server + " --stream " + streamName, 0, "executed coverity defects", "");
    return execs;
}
function mockCommand(execs, command, code, out, err) {
    execs[command] = { code: code, stdout: out, stderr: err };
}
function registerMockBaseCommmands(tmr, bin, cwd, server, streamName) {
    var execs = mockBaseCommands(bin, cwd, server, streamName);
    var mtt = require('azure-pipelines-task-lib/mock-toolrunner');
    mtt.setAnswers({ exec: execs });
    tmr.registerMock('azure-pipelines-task-lib/toolrunner', mtt);
}
module.exports = {
    setServiceInputs: setServiceInputs,
    setToolHome: setToolHome,
    mockBaseCommands: mockBaseCommands,
    mockCommand: mockCommand,
    registerMockBaseCommmands: registerMockBaseCommmands
};
