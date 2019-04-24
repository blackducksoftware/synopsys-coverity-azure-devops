"use strict";
exports.__esModule = true;
var tmrm = require("azure-pipelines-task-lib/mock-run");
var path = require("path");
var taskPath = path.join(__dirname, '..', 'index.js');
var tmr = new tmrm.TaskMockRunner(taskPath);
//Set the coverity service username, password and url as the following environment variables.
//process.env[<key>] = "<value>";
//ENDPOINT_URL_COVERITYSERVICE
//ENDPOINT_AUTH_PARAMETER_COVERITYSERVICE_USERNAME
//ENDPOINT_AUTH_PARAMETER_COVERITYSERVICE_PASSWORD
var endpointEnvId = 'COVERITYSERVICE';
tmr.setInput('projectName', 'Synopsys Detect');
tmr.setInput('streamName', 'Synopsys Detect');
tmr.run();
