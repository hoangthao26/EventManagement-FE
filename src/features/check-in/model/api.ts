import { Event, Participant, CheckInResponse } from './types';
import { getSession } from 'next-auth/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://14.225.218.214:8080/api/v1';

// Lấy danh sách event cho staff
export const getStaffEvents = async (): Promise<Event[]> => {
    const session = await getSession();
    const res = await fetch(`${API_BASE}/events/staff`, {
        headers: {
            'Authorization': `Bearer ${session?.accessToken}`,
        },
    });
    if (!res.ok) throw new Error('Failed to fetch staff events');
    const data = await res.json();
    console.log('API Response:', data);
    // Map lại để trả về đúng kiểu Event[]
    return data.map((item: any) => {
        console.log('Event Item:', item.eventInfo);
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
};

// Tìm kiếm participant theo email
export const searchParticipant = async (eventId: number, email: string): Promise<Participant | null> => {
    const session = await getSession();
    const res = await fetch(`${API_BASE}/registrations/${eventId}/search?email=${encodeURIComponent(email)}`, {
        headers: {
            'Authorization': `Bearer ${session?.accessToken}`,
        },
    });
    if (!res.ok) return null;
    return res.json();
};

// Check-in participant
export const checkInParticipant = async (eventId: number, email: string): Promise<CheckInResponse> => {
    const session = await getSession();
    try {
        const res = await fetch(`${API_BASE}/registrations/${eventId}/checkin?email=${encodeURIComponent(email)}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session?.accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error('Check-in error:', errorData);
            throw new Error(errorData.message || 'Check-in failed');
        }
        return res.json();
    } catch (error) {
        console.error('Check-in error:', error);
        throw error;
    }
}; 