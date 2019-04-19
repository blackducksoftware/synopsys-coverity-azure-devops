"use strict";
exports.__esModule = true;
var path = require("path");
var assert = require("assert");
var ttm = require("azure-pipelines-task-lib/mock-test");
describe('Test connection to coverity', function () {
    before(function () {
    });
    after(function () {
    });
    it('should succeed with simple inputs', function (done) {
        this.timeout(5000);
        var tp = path.join(__dirname, 'success.js');
        var tr = new ttm.MockTestRunner(tp);
        tr.run();
        console.log(tr.stdout);
        assert.equal(tr.succeeded, true, 'should have succeeded');
        assert.equal(tr.warningIssues.length, 0, "should have no warnings");
        assert.equal(tr.errorIssues.length, 0, "should have no errors");
        console.log("Test Finished.");
        //assert.equal(tr.stdout.indexOf('Hello human') >= 0, true, "should display Hello human");
        done();
    });
});
