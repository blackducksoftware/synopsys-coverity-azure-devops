declare module CoverityTypes {

    export interface ComponentMapId {
        name: string;
    }

    export interface Id {
        name: string;
    }

    export interface PrimaryProjectId {
        name: string;
    }

    export interface TriageStoreId {
        name: string;
    }

    export interface Stream {
        autoDeleteOnExpiry: boolean;
        componentMapId: ComponentMapId;
        description: string;
        id: Id;
        language: string;
        outdated: boolean;
        primaryProjectId: PrimaryProjectId;
        triageStoreId: TriageStoreId;
        enableDesktopAnalysis: boolean;
        ownerAssignmentOption: string;
    }

    export interface RoleId {
        name: string;
    }

    export interface RoleAssignment {
        roleAssignmentType: string;
        roleId: RoleId;
        type: string;
        username: string;
    }

    export interface Id2 {
        name: string;
    }

    export interface Project {
        streams: Stream[];
        roleAssignments: RoleAssignment[];
        dateCreated: Date;
        dateModified: Date;
        description: string;
        id: Id2;
        projectKey: string;
        userCreated: string;
        userModified: string;
    }

}

