import axiosInstance from '@/shared/lib/axios';
import { CreateEventData, Event, EventListResponse, UpdateEventData } from '../model/types';

export const eventApi = {
    // Lấy danh sách sự kiện
    getEvents: async (params: {
        page?: number;
        pageSize?: number;
        search?: string;
        status?: string;
        typeId?: number;
        departmentCode?: string;
    }): Promise<EventListResponse> => {
        const { data } = await axiosInstance.get('/events', { params });
        return data;
    },

    // Lấy chi tiết sự kiện
    getEventById: async (id: number): Promise<Event> => {
        const { data } = await axiosInstance.get(`/events/${id}`);
        return data;
    },

    // Tạo sự kiện mới
    createEvent: async (eventData: CreateEventData): Promise<Event> => {
        const { data } = await axiosInstance.post('/events', eventData);
        return data;
    },

    // Cập nhật sự kiện
    updateEvent: async (eventData: UpdateEventData): Promise<Event> => {
        const { id, ...updateData } = eventData;
        const { data } = await axiosInstance.put(`/events/${id}`, updateData);
        return data;
    },

    // Xóa sự kiện
    deleteEvent: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/events/${id}`);
    },

    // Cập nhật trạng thái sự kiện
    updateEventStatus: async (id: number, status: string): Promise<Event> => {
        const { data } = await axiosInstance.patch(`/events/${id}/status`, { status });
        return data;
    },

    // Đăng ký tham gia sự kiện
    registerForEvent: async (eventId: number): Promise<void> => {
        await axiosInstance.post(`/events/${eventId}/register`);
    },

    // Hủy đăng ký tham gia sự kiện
    unregisterFromEvent: async (eventId: number): Promise<void> => {
        await axiosInstance.delete(`/events/${eventId}/register`);
    },

    // Lấy danh sách người tham gia sự kiện
    getEventParticipants: async (eventId: number, params: {
        page?: number;
        pageSize?: number;
        role?: string;
    }): Promise<{
        participants: Array<{
            id: number;
            name: string;
            email: string;
            role: string;
            registeredAt: string;
        }>;
        total: number;
    }> => {
        const { data } = await axiosInstance.get(`/events/${eventId}/participants`, { params });
        return data;
    },

    // Upload ảnh sự kiện
    uploadEventImage: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await axiosInstance.post('/events/upload-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },
}; 