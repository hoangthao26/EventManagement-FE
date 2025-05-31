import { EventListResponse } from './types';
import axiosInstance from '@/shared/lib/axios';

export const eventApi = {
    getEventsByDepartment: async (departmentCode: string): Promise<EventListResponse> => {
        const response = await axiosInstance.get<EventListResponse>(
            `/events/management/${departmentCode}`
        );
        return response.data;
    },
}; 