"use strict";
exports.__esModule = true;
var tmrm = require("azure-pipelines-task-lib/mock-run");
var path = require("path");
var taskPath = path.join(__dirname, '..', 'index.js');
var tmr = new tmrm.TaskMockRunner(taskPath);
tmr.setInput('samplestring', 'bad');
tmr.run();
