export type SurveyQuestionType = 'TEXT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';

export interface SurveyQuestion {
    id: number; // id tăng dần
    type: SurveyQuestionType;
    question: string;
    description?: string;
    required: boolean;
    options?: string[]; // chỉ dùng cho SINGLE_CHOICE, MULTIPLE_CHOICE
}

export interface SurveyFormData {
    eventId: number;
    questions: SurveyQuestion[];
} 