import { EventStatus } from '../../list/model/types';

export interface EventDetailsResponse {
    id: number;
    name: string;
    description: string;
    typeId: number;
    typeName: string;
    audience: 'STUDENT' | 'LECTURER' | 'BOTH';
    posterUrl: string;
    bannerUrl: string;
    mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
    location?: {
        address: string;
        ward: string;
        district: string;
        city: string;
    };
    maxCapacityStudent: number;
    maxCapacityLecturer: number;
    platform?: {
        name: string;
        url: string;
    };
    tags: Array<{
        id: number;
        name: string;
    }>;
    images: Array<{
        id: number;
        url: string;
    }>;
    startTime: string;
    endTime: string;
    registrationStart: string;
    registrationEnd: string;
    status: EventStatus;
}

export interface UpdateEventPayload {
    name: string;
    description: string;
    typeId: number;
    audience: 'STUDENT' | 'LECTURER' | 'BOTH';
    posterUrl: string;
    bannerUrl: string;
    mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
    location: {
        address: string;
        ward: string;
        district: string;
        city: string;
    };
    maxCapacity: number;
    roleCapacities: Array<{
        roleName: 'STUDENT' | 'LECTURER';
        maxCapacity: number;
    }>;
    platform?: {
        name: string;
        url: string;
    };
    tags: number[];
    imageUrls: string[];
    startTime: string;
    endTime: string;
    registrationStart: string;
    registrationEnd: string;
} 