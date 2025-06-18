export interface SurveyOption {
    id?: string | number;
    text: string;
    orderNum: number;
}

export interface SurveyQuestion {
    id?: string | number;
    question: string;
    orderNum: number;
    type: string;
    isRequired: boolean;
    options?: SurveyOption[];
}

export interface SurveyCreate {
    eventId: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    questions: SurveyQuestion[];
    status?: 'DRAFT' | 'OPENED' | 'CLOSED';
    createdAt?: string;
    updatedAt?: string;
}

// Types cho API requests
export interface SurveyCreateRequest {
    eventId: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    questions: Omit<SurveyQuestion, 'id'>[];
}

export interface SurveyUpdateRequest {
    eventId: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    questions: SurveyQuestion[]; // Có id
} 