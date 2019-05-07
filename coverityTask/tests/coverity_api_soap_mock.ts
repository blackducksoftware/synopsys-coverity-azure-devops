import soap = require("soap");
import CoverityTypes = require("../coverity_types");
import CoverityApi = require("../coverity_api_soap");

function newMock(shouldConnect: boolean, projectName?:string, streamName?:string) {
    var stream: CoverityTypes.Stream|null = null;
    var project: CoverityTypes.Project|null = null;
    
    if (projectName){
        var streams = new Array<CoverityTypes.Stream>();
        if (streamName){
            stream = {
                autoDeleteOnExpiry: false,
                componentMapId: {
                    name: "componentMapId"
                },
                description: "string",
                id: {
                    name: streamName!
                },
                language: "string",
                outdated: true,
                primaryProjectId: {
                    name:projectName!
                },
                triageStoreId: {
                    name: "triageId"
                },
                enableDesktopAnalysis: true,
                ownerAssignmentOption: "string"
            };
            streams.push(stream);
        }
        project = {
            streams: streams,
            roleAssignments: new Array<CoverityTypes.RoleAssignment>(),
            dateCreated: new Date(),
            dateModified: new Date(),
            description: "",
            id: {
                name: projectName!
            },
            projectKey: "",
            userCreated: "",
            userModified: ""
        };
    }

    var mock:any = {
        connectAsync: async function (server:string, username:string, password:string): Promise<boolean> {
            console.log("Mock connect invoked.");
            if (shouldConnect) {
                return false;
            } else {
                this.client = {};
                return true;
            }
        },
        findProjectAsync: async function(name:string):Promise<CoverityTypes.Project|null> {
            console.log("Mock find project invoked.");
            return project;
        },
        findStreamAsync: async function(proect:CoverityTypes.Project, name:string):Promise<CoverityTypes.Stream|null> {
            console.log("Mock find stream invoked.");            
            return stream;
        },
        createProjectAsync: async function (project:CoverityTypes.ProjectSpec) {
        },
        createStreamAsync: async function (projectName: string, stream: CoverityTypes.StreamSpec) {
        },
        client: undefined
    }
    
    return mock;
}

module.exports = newMock;