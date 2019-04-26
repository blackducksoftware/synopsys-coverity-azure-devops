import soap = require("soap");
import CoverityTypes = require("./coverity_types");

interface CoverityApi {
    connectAsync(url:string, username: string, password: string): Promise<boolean>,
    findProjectAsync(name:string):Promise<any>,
    findStreamAsync(project:any, name:string):Promise<any>,
    createProjectAsync(projectSpec:any):Promise<any>,
    createStreamAsync(projectName:string, streamSpec:any):Promise<any>,
    client?: CoverityClient
}

interface CoverityClient extends soap.Client {
    getProjectsAsync: (params?: any) => any;
    createProjectAsync: (params?: any) => any;
    createStreamInProjectAsync: (param1?: any, param2?: any) => any;
}


var coverity_api: CoverityApi = {
    connectAsync: async function (server:string, username:string, password:string): Promise<boolean> {
        var url = server + "/ws/v9/configurationservice?wsdl";
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
    createProjectAsync: async function (project:CoverityTypes.ProjectSpec) {
        await this.client!.createProjectAsync({projectSpec: project});
    },
    createStreamAsync: async function (projectName: string, stream: CoverityTypes.StreamSpec) {
        await this.client!.createStreamInProjectAsync({projectId: {name: projectName}, streamSpec: stream});
    },
    client: undefined
}


module.exports = coverity_api;