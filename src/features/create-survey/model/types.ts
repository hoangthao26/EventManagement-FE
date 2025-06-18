export type SurveyQuestionType = 'TEXT' | 'RADIO' | 'CHECKBOX' | 'DROPDOWN' | 'RATING';

export interface SurveyOption {
    text: string;
    orderNum: number;
}

export interface SurveyQuestion {
    id: string;
    question: string;
    orderNum: number;
    type: SurveyQuestionType;
    isRequired: boolean;
    options?: SurveyOption[];
}

export interface SurveyFormData {
    eventId: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    questions: SurveyQuestion[];
} 