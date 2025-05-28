export type EventType = 'SEMINAR' | 'WORKSHOP' | 'ORIENTATION';

export interface EventCapacity {
    student: number;
    lecturer: number;
}

export interface CreateEventData {
    title: string;
    address: string;
    startTime: Date;
    endTime: Date;
    registrationStartTime: Date;
    registrationEndTime: Date;
    type: EventType;
    capacity: EventCapacity;
    description: string;
    poster: string;
    banner: string;
    descriptionImages: string[];
    departmentInfo: string;
}

export interface ImageUploadResponse {
    url: string;
    public_id: string;
} 