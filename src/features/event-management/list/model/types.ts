export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type EventMode = 'ONLINE' | 'OFFLINE';
export type EventAudience = 'STUDENT' | 'LECTURER' | 'BOTH';

export interface Event {
    id: number;
    name: string;
    typeName: string;
    audience: EventAudience;
    locationAddress: string;
    startTime: string;
    endTime: string;
    mode: EventMode;
    createdAt: string;
    updatedAt: string;
    status: EventStatus;
}

// API returns array of events directly
export type EventListResponse = Event[]; 