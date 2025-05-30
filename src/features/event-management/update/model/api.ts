import axiosInstance from '@/shared/lib/axios';
import { EventDetailsResponse, UpdateEventPayload } from './types';

export const getEventDetails = async (departmentCode: string, eventId: number): Promise<EventDetailsResponse> => {
    const response = await axiosInstance.get(`/events/management/${departmentCode}/event/${eventId}`);
    return response.data;
};

export const updateEvent = async (departmentCode: string, eventId: number, payload: UpdateEventPayload): Promise<void> => {
    await axiosInstance.put(`/events/management/${departmentCode}/event/${eventId}`, payload);
}; 