import axiosInstance from '@/shared/lib/axios';

export const authApi = {
    // Logout
    logout: async (refreshToken: string) => {
        try {
            const response = await axiosInstance.post('/auth/logout', { refreshToken });
            return response.data;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    // Refresh Token
    refreshToken: async (refreshToken: string) => {
        try {
            const response = await axiosInstance.post('/auth/refresh', { refreshToken });
            return response.data;
        } catch (error) {
            console.error('Refresh token error:', error);
            throw error;
        }
    },

    // // Get User Profile
    // getProfile: async () => {
    //     try {
    //         const response = await axiosInstance.get('/auth/profile');
    //         return response.data;
    //     } catch (error) {
    //         console.error('Get profile error:', error);
    //         throw error;
    //     }
    // },

    // // Update User Profile
    // updateProfile: async (data: any) => {
    //     try {
    //         const response = await axiosInstance.put('/auth/profile', data);
    //         return response.data;
    //     } catch (error) {
    //         console.error('Update profile error:', error);
    //         throw error;
    //     }
    // }
}; 