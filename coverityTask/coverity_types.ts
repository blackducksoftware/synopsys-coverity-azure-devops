
import soap = require("soap");

export interface Id {
    name: string;
}

export interface Stream {
    autoDeleteOnExpiry: boolean;
    componentMapId: Id;
    description: string;
    id: Id;
    language: string;
    outdated: boolean;
    primaryProjectId: Id;
    triageStoreId: Id;
    enableDesktopAnalysis: boolean;
    ownerAssignmentOption: string;
}

export interface RoleAssignment {
    roleAssignmentType: string;
    roleId: Id;
    type: string;
    username: string;
}

export interface Project {
    streams: Stream[];
    roleAssignments: RoleAssignment[];
    dateCreated: Date;
    dateModified: Date;
    description: string;
    id: Id;
    projectKey: string;
    userCreated: string;
    userModified: string;
}

export interface GroupSpec {
    displayName: string;
    name: string;
}

export interface RoleSpec {
    name: string;
}

export interface TriageStoreId {
    name: string;
}

export interface RoleAssignmentSpec {
    groupId: GroupSpec;
    roleAssignmentType: Id;
    roleId: RoleSpec;
    type: string;
    username: string;
}

export interface ProjectSpec {
    description: string;
    name: string;
    roleAssignments: RoleAssignmentSpec[];
    //ignoring: streams, streamLinks
}

export interface StreamSpec {
    description: string;
    enableDesktopAnalysis: boolean;
    language: string;
    name: string;
    triageStoreId: TriageStoreId[];
}

export interface IssueViewList {
    views: IssueView[];
}

export interface IssueView {
    id: number;
    name: string;
}

//Move the below to their own area.
//Maybe sort things a little more.

export class CoverityCommand {
    tool: string;
    commandArgs: string[] = [];
    commandMultiArgs: string[] = [];

    constructor(tool:string, commandArgs: string[], commandMultiArgs: string[]) {
        this.tool = tool;
        this.commandArgs = commandArgs;
        this.commandMultiArgs = commandMultiArgs;
    }
}

export interface CoveritySoapApi {
    connectAsync(url:string, username: string, password: string, allowInsecure:boolean): Promise<boolean>,
    findProjectAsync(name:string):Promise<any>,
    findStreamAsync(project:any, name:string):Promise<any>,
    createProjectAsync(projectSpec:any):Promise<any>,
    createStreamAsync(projectName:string, streamSpec:any):Promise<any>,
    client?: CoverityClient
}

export interface CoverityClient extends soap.Client {
    getProjectsAsync: (params?: any) => any;
    createProjectAsync: (params?: any) => any;
    createStreamInProjectAsync: (param1?: any, param2?: any) => any;
}

export interface CoverityRestApi {
    connectAsync(url:string, username: string, password: string, allowInsecure:boolean): Promise<boolean>,
    findViews():Promise<IssueViewList>,
    findDefects(project:any, name:string):Promise<any>,
    auth?:string
    server?:string
}

export interface CoverityEnvironment {
    coverityToolHome: string,
    username: string, 
    password: string,
    url:string, 
    project:string,
    stream:string,
    idir?: string
    view?:string
}