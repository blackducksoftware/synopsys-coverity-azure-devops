
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

