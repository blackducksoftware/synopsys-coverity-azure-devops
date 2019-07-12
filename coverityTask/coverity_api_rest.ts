var request = require("request-promise-native");
import CoverityTypes = require("./coverity_types");
var urljoin = require('url-join');

//move url join to static class.

var coverity_api: CoverityTypes.CoverityRestApi = {
    connectAsync: async function (server:string, username:string, password:string, allowInsecure:boolean): Promise<boolean> {
        this.auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
        this.server = server;
        this.allowInsecure = allowInsecure;
        return true;
    },
    findViews: async function():Promise<CoverityTypes.IssueViewList> {
        var url = urljoin(this.server, "/api/views/v1");
        var response:any = await request({ url : url, headers : { "Authorization" : this.auth }, json: true, insecure: this.allowInsecure });
        return response;
    },
    findDefects: async function(streamId:string, projectId:string):Promise<any> {
        console.log("Getting views for stream " + streamId.toString() + " and project " + projectId.toString());
        var url = urljoin(this.server, "/api/viewContents/issues/v1/",  streamId.toString(), "?projectId=" + projectId.toString());
        console.log("Fetching url: " + url);
        var response:any = await request({ url : url, headers : { "Authorization" : this.auth }, json: true, insecure: this.allowInsecure });
        return response;
    },
    server: undefined,
    auth: undefined
}


module.exports = coverity_api;