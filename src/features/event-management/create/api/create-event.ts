import { CreateEventData } from '../model/types';
import { api } from '@/shared/api/index';

export const createEvent = async (data: CreateEventData) => {
    try {
        const response = await api.post('/events', data);
        return response.data;
    } catch (error) {
        throw new Error('Failed to create event');
    }
}; 