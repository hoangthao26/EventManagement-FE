import axiosInstance from '@/shared/lib/axios';

export const fetchEventTypes = async () => {
    const res = await axiosInstance.get('/event-types');
    return res.data;
}; 