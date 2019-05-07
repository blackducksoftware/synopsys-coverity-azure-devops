console.log('test starts');

import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');
import * as assert from 'assert';

console.log("normal imports done")
var testUtil = require('./test_util');
console.log("test imports done")


console.log('creating task')
let taskPath = path.join(__dirname, '..', 'index.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

console.log('reading config');

var config = require("./config.json");

console.log('populating variables');

var cwd = config.cwd;
var home = config.home;
var bin = home + "\\bin";

var projectName = config.availableProjectName;
var streamName = config.availableStreamName;
var server = config.server;
var viewName = "All Projects";

console.log('set inputs');

tmr.setInput('projectName', projectName);
tmr.setInput('streamName', streamName);
tmr.setInput('issueView', "Outstanding Issues");
tmr.setInput('cwd', cwd);
tmr.setInput('coverityRunType', "buildanalyzecommit");
tmr.setInput('coverityAnalysisType', "full");

console.log('test utils');

testUtil.setToolHome(config.toolHome);
testUtil.setServiceInputs(server, config.username, config.password);
testUtil.registerMockBaseCommmands(tmr, bin, cwd, server, streamName);

//var mockApi = require("./coverity_soap_api_mock")(true, projectName, streamName);
//tmr.registerMock('./coverity_soap_api', mockApi);
console.log('test ready');

tmr.run();
