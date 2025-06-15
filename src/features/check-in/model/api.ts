import { Event, Participant, CheckInResponse } from './types';
import axiosInstance from '@/shared/lib/axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://14.225.218.214:8080/api/v1';

// Lấy danh sách event cho staff
export const getStaffEvents = async (): Promise<Event[]> => {
    try {
        const res = await axiosInstance.get('/events/staff');
        const data = res.data;
        // Map lại để trả về đúng kiểu Event[]
        return data.map((item: any) => {
            return {
                id: item.eventInfo.id,
                name: item.eventInfo.name,
                startTime: item.eventInfo.startTime,
                endTime: item.eventInfo.endTime,
                audience: item.eventInfo.audience,
                bannerUrl: item.eventInfo.bannerUrl,
                status: item.eventInfo.status,
                location: item.eventInfo.locationAddress,
                staffRoles: item.staffRoles,
                mode: item.eventInfo.mode,
            };
        });
    } catch (error) {
        throw new Error('Failed to fetch staff events');
    }
};

// Tìm kiếm participant theo email
export const searchParticipant = async (eventId: number, email: string): Promise<Participant | null> => {
    try {
        const res = await axiosInstance.get(`/registrations/${eventId}/search?email=${encodeURIComponent(email)}`);
        return res.data;
    } catch (error: any) {
        if (error?.response?.status === 400) {
            throw new Error('Invalid input. Please check the email format.');
        }
        if (error?.response?.status === 403) {
            throw new Error('You do not have permission to search registrations.');
        }
        if (error?.response?.status === 404) {
            throw new Error('User not found.');
        }
        throw new Error('Failed to search participant');
    }
};

// Check-in participant (manual by email)
export const checkInParticipant = async (eventId: number, email: string): Promise<CheckInResponse> => {
    try {
        const res = await axiosInstance.post(`/registrations/${eventId}/checkin?email=${encodeURIComponent(email)}`);
        return res.data;
    } catch (error: any) {
        const errorData = error?.response?.data || {};
        throw new Error(errorData.message || 'Check-in failed');
    }
};

// Check-in participant by QR code (encrypted)
export const checkInByQRCode = async (checkinCode: string): Promise<CheckInResponse> => {
    try {
        const res = await axiosInstance.post(`/registrations/checkin?checkinCode=${encodeURIComponent(checkinCode)}`);
        return res.data;
    } catch (error: any) {
        const errorData = error?.response?.data || {};
        throw new Error(errorData.message || 'Check-in failed');
    }
}; 