var request = require("request-promise-native");
import CoverityTypes = require("./coverity_types");

interface CoverityRestApi {
    connectAsync(url:string, username: string, password: string): Promise<boolean>,
    findViews():Promise<CoverityTypes.IssueViewList>,
    findDefects(project:any, name:string):Promise<any>,
    auth?:string
    url?:string
}


var coverity_api: CoverityRestApi = {
    connectAsync: async function (server:string, username:string, password:string): Promise<boolean> {
        this.auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
        this.url = server;
        return true;
    },
    findViews: async function():Promise<CoverityTypes.IssueViewList> {
        var url = this.url + "/api/views/v1";
        var response:any = await request({ url : url, headers : { "Authorization" : this.auth }, json: true });
        return response;
    },
    findDefects: async function(streamId:string, projectId:string):Promise<any> {
        var url = this.url + "/api/viewContents/issues/v1/" + streamId + "?projectId=" + projectId;
        var response:any = await request({ url : url, headers : { "Authorization" : this.auth }, json: true });
        return response;
    },
    url: undefined,
    auth: undefined
}


module.exports = coverity_api;