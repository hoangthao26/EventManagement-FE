import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const authApi = {
    // Logout
    logout: async (refreshToken: string) => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/logout`, { refreshToken });
            return response.data;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    // Refresh Token
    refreshToken: async (refreshToken: string) => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
            return response.data;
        } catch (error) {
            console.error('Refresh token error:', error);
            throw error;
        }
    }


}; 