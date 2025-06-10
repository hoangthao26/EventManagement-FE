import axiosInstance from '@/shared/lib/axios';
import { User, UserProfile, UpdateUserProfileData } from './types';

export const userApi = {
    // Get user profile
    getProfile: async (): Promise<UserProfile> => {
        const response = await axiosInstance.get('/users/profile');
        return response.data;
    },

    // Update user profile
    updateProfile: async (data: UpdateUserProfileData): Promise<UserProfile> => {
        const response = await axiosInstance.put('/users/profile', data);
        return response.data;
    },

    // Get user by ID
    getUserById: async (userId: string): Promise<User> => {
        const response = await axiosInstance.get(`/users/${userId}`);
        return response.data;
    },

    // Get users by department
    getUsersByDepartment: async (departmentCode: string): Promise<User[]> => {
        const response = await axiosInstance.get(`/users/department/${departmentCode}`);
        return response.data;
    },

    // Get users by role
    getUsersByRole: async (role: string): Promise<User[]> => {
        const response = await axiosInstance.get(`/users/role/${role}`);
        return response.data;
    }
}; 