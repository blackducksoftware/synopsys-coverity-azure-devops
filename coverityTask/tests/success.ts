import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');
import * as assert from 'assert';

let taskPath = path.join(__dirname, '..', 'index.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

//Set the coverity service username, password and url as the following environment variables.
//process.env[<key>] = "<value>";
//ENDPOINT_URL_COVERITYSERVICE
//ENDPOINT_AUTH_PARAMETER_COVERITYSERVICE_USERNAME
//ENDPOINT_AUTH_PARAMETER_COVERITYSERVICE_PASSWORD

var cwd = "C:\\Program Files (x86)\\Jenkins\\workspace\\Coverity-Test";
var home = "C:\\Program Files\\Coverity\\Coverity Static Analysis";
var bin = home + "\\bin";

var projectName = 'Detect Project';
var streamName = 'Development Stream';
var endpointEnvId = 'COVERITYSERVICE';

tmr.setInput('projectName', projectName);
tmr.setInput('streamName', streamName);
tmr.setInput('cwd', cwd);

var execs = {};
mockCommand(execs, `${bin}\\cov-build.exe --dir ${cwd}\\idir`, 0, "", "");
mockCommand(execs, `${bin}\\cov-analyze.exe --dir ${cwd}\\idir`, 0, "", "");
mockCommand(execs, `${bin}\\cov-commit-defects.exe --dir ${cwd}\\idir --url ${server} --stream ${streamName}`, 0, "", "");

var mtt = require('azure-pipelines-task-lib/mock-toolrunner');
mtt.setAnswers({ exec: execs });
tmr.registerMock('azure-pipelines-task-lib/toolrunner', mtt);

tmr.run();

function mockCommand(execs:any, command:string, code:number, out:string, err:string){
    execs[command] =  { code : code, stdout: out, stderr: err };
}