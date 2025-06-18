import axiosInstance from '@/shared/lib/axios';
import { SurveyFormData } from '@/features/create-survey/model/types';

export const surveyApi = {
    createSurvey: async (departmentCode: string, data: SurveyFormData) => {
        const res = await axiosInstance.post(`/api/v1/surveys?departmentCode=${departmentCode}`, data);
        return res.data;
    },
}; 