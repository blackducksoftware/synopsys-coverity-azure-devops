import soap = require("soap");
import CoverityTypes = require("./coverity_types");

interface CoverityApi {
    connectAsync(url:string, username: string, password: string): Promise<boolean>,
    findProjectAsync(name:string):Promise<any>,
    findStreamAsync(project:any, name:string):Promise<any>,
    client?: CoverityClient
}

interface CoverityClient extends soap.Client {
    getProjectsAsync: (params?: any) => any;
}


var coverity_api: CoverityApi = {
    connectAsync: async function (url:string, username:string, password:string): Promise<boolean> {
        var soapClient = await soap.createClientAsync(url) as any;
        this.client = soapClient as CoverityClient;
        
        var options = {
            hasNonce: false,
            digestPassword: false,
        };
        
        var wsSecurity = new soap.WSSecurity(username, password, options)
        this.client.setSecurity(wsSecurity);

        return true;
    },
    findProjectAsync: async function(name:string):Promise<CoverityTypes.Project|null> {
        var [result, rawResponse, soapheader, rawRequest] = await this.client!.getProjectsAsync();

        var projects = result.return;
        var project: any = null;
        projects.forEach((element: any) => {
            if (element.id.name == name){
                project = element;
            }
        });
        return project;
    },
    findStreamAsync: async function(project:CoverityTypes.Project, name:string):Promise<CoverityTypes.Stream|null> {
        var stream: any = null;
        project.streams.forEach((element: any) => {
            if (element.id.name == name){
                stream = element;
            }
        })
        return stream;
    },
    client: undefined
}


module.exports = coverity_api;