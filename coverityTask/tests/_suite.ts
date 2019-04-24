import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';

describe('Test connection to coverity', function () {

    before( function() {

    });

    after(() => {

    });

    it('should succeed with simple inputs', function(done: MochaDone) {
        this.timeout(5000);
    
        let tp = path.join(__dirname, 'success.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
    
        tr.run();
        console.log(tr.stdout);
        assert.equal(tr.succeeded, true, 'should have succeeded: ' + tr.errorIssues.join(","));
        assert.equal(tr.warningIssues.length, 0, "should have no warnings");
        assert.equal(tr.errorIssues.length, 0, "should have no errors");
        console.log("Test Finished.");
        assert_in_stdout(tr, "Project: ", "Unable to find project.");
        assert_in_stdout(tr, "Stream: ", "Unable to find project.");
        done();
    });
});

function assert_in_stdout(tr: any, str:any, message: any) {
    assert.equal(tr.stdout.indexOf(str) >= 0, true, message);
}