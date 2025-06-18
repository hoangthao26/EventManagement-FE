export interface EventMember {
    eventName: string;
    staffName: string;
    email: string;
    roleName: string[];
    assignedAt: string;
    updatedAt: string;
}

export enum EventMemberRole {
    EVENT_MANAGER = 'EVENT_MANAGER',
    EVENT_CHECKIN = 'EVENT_CHECKIN',
    EVENT_STAFF = 'EVENT_STAFF',
}

export interface AddMemberRequest {
    email: string;
    roleName: string[];
}

export interface EventMembersResponse {
    members: EventMember[];
    total: number;
    page: number;
    pageSize: number;
} 