import { AddMemberRequest, EventMember, EventMembersResponse, EventMemberRole } from './types';
import axiosInstance from '@/shared/lib/axios';

const ROLE_DESCRIPTIONS = {
    [EventMemberRole.EVENT_MANAGER]: 'Quản lý sự kiện',
    [EventMemberRole.EVENT_CHECKIN]: 'Check-in sự kiện',
    [EventMemberRole.EVENT_STAFF]: 'Hỗ trợ sự kiện',
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Lấy danh sách thành viên sự kiện
export const getEventMembers = async (
    departmentCode: string,
    eventId: number,
    page: number = 1,
    pageSize: number = 10
): Promise<EventMembersResponse> => {
    const response = await axiosInstance.get(`/staffs/management/${departmentCode}/event/${eventId}`, {
        params: { page, pageSize }
    });
    // Nếu API trả về mảng, bọc lại thành object chuẩn
    if (Array.isArray(response.data)) {
        return {
            members: response.data,
            total: response.data.length,
            page: 1,
            pageSize: response.data.length
        };
    }
    return response.data;
};

// Thêm thành viên vào sự kiện
export const addEventMember = async (
    departmentCode: string,
    eventId: number,
    data: { email: string; roleName: string[] }
): Promise<EventMember> => {
    const response = await axiosInstance.post(`/staffs/management/${departmentCode}/event/${eventId}/assign`, data);
    return response.data;
};

// Cập nhật vai trò thành viên trong sự kiện
export const updateMemberRole = async (
    departmentCode: string,
    eventId: number,
    email: string,
    roleName: string[]
): Promise<EventMember> => {
    const response = await axiosInstance.put(`/staffs/management/${departmentCode}/event/${eventId}/update`, {
        email,
        roleName
    });
    return response.data;
};

// Xóa thành viên khỏi sự kiện
export const removeEventMember = async (
    departmentCode: string,
    eventId: number,
    staffEmail: string
): Promise<void> => {
    await axiosInstance.delete(`/staffs/management/${departmentCode}/event/${eventId}`, {
        params: { staffEmail }
    });
};

// Lấy toàn bộ staff roles
export const getStaffRoles = async (): Promise<string[]> => {
    const response = await axiosInstance.get('/staffs/roles');
    return response.data;
}; 