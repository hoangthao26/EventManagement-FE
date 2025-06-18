export interface Event {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    location: string;
    status: 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED' | 'BLOCKED' | 'CLOSED';
    bannerUrl?: string;
    audience?: string;
    staffRoles?: string[];
    mode?: 'ONLINE' | 'OFFLINE';
}

export interface Participant {
    id: number;
    email: string;
    name: string;
    eventName?: string;
    registrationStatus?: 'REGISTERED' | 'CANCELED' | 'ATTENDED' | 'ABSENT';
    registeredAt?: string;
    checkTime?: string;
}

export interface CheckInResponse {
    id: number;
    email: string;
    name: string;
    eventName: string;
    status: 'REGISTERED' | 'CANCELED' | 'ATTENDED' | 'ABSENT';
    createdAt: string;
    cancelledAt?: string;
} 