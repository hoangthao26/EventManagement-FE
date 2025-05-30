import axiosInstance from '@/shared/lib/axios';

export const fetchActiveTags = async () => {
    const res = await axiosInstance.get('/tags/active');
    return res.data;
};