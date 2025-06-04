import axiosInstance from '@/shared/lib/axios';
import { EventDetailsResponse, UpdateEventPayload } from './types';
import { EventStatus } from '../../list/model/types';

export const getEventDetails = async (departmentCode: string, eventId: number): Promise<EventDetailsResponse> => {
    const response = await axiosInstance.get(`/events/management/${departmentCode}/event/${eventId}`);
    return response.data;
};

export const updateEvent = async (departmentCode: string, eventId: number, payload: UpdateEventPayload): Promise<void> => {
    console.log('Update Event Request Details:');
    console.log('URL:', `/events/management/${departmentCode}/event/${eventId}`);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    await axiosInstance.put(`/events/management/${departmentCode}/event/${eventId}`, payload);
};

export const updateEventStatus = async (departmentCode: string, eventId: number, newStatus: EventStatus): Promise<void> => {
    await axiosInstance.put(`/events/management/${departmentCode}/event/${eventId}/status?newStatus=${newStatus}`);
};

export const deleteEvent = async (departmentCode: string, eventId: number): Promise<void> => {
    await axiosInstance.delete(`/events/management/${departmentCode}/event/${eventId}`);
}; 