export type EventMode = 'ONLINE' | 'OFFLINE' | 'HYBRID';
export type EventAudience = 'STUDENT' | 'LECTURER' | 'BOTH';
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'BLOCKED';

export interface EventLocation {
    address: string;
    ward: string;
    district: string;
    city: string;
}

export interface EventPlatform {
    name: string;
    url: string;
}

export interface EventRoleCapacity {
    roleName: 'STUDENT' | 'LECTURER';
    maxCapacity: number;
}

export interface EventTag {
    id: number;
    name: string;
}

export interface EventImage {
    id: number;
    url: string;
}

export interface Event {
    id: number;
    name: string;
    description: string;
    typeId: number;
    typeName: string;
    audience: EventAudience;
    posterUrl: string;
    bannerUrl: string;
    mode: EventMode;
    location?: EventLocation;
    maxCapacity: number;
    roleCapacities: EventRoleCapacity[];
    platform?: EventPlatform;
    tags: EventTag[];
    images: EventImage[];
    startTime: string;
    endTime: string;
    registrationStart: string;
    registrationEnd: string;
    status: EventStatus;
    departmentCode: string;
    departmentName: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateEventData {
    name: string;
    description: string;
    typeId: number;
    audience: EventAudience;
    posterUrl: string;
    bannerUrl: string;
    mode: EventMode;
    location?: EventLocation;
    maxCapacity: number;
    roleCapacities: EventRoleCapacity[];
    platform?: EventPlatform;
    tags: number[];
    imageUrls: string[];
    startTime: string;
    endTime: string;
    registrationStart: string;
    registrationEnd: string;
    departmentCode: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
    id: number;
}

export interface EventListResponse {
    events: Event[];
    total: number;
    page: number;
    pageSize: number;
}
