
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