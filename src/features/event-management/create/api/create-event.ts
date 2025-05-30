import { CreateEventData } from '../model/types';
import { api } from '@/shared/api/index';

export const createEvent = async (data: any) => {
    console.log(data)
    try {
        const response = await api.post(
            `/events/management/${data.departmentCode}/event`,
            data
        );
        // Log status code và response data
        console.log('Create event status:', response.status);
        console.log('Create event response:', response.data);
        return response.data;
    } catch (error: any) {
        // Log lỗi chi tiết từ backend nếu có
        if (error.response) {
            console.error('Create event error status:', error.response.status);
            console.error('Create event error data:', error.response.data);
        } else {
            console.error('Create event error:', error.message);
        }
        throw new Error('Failed to create event');
    }
};