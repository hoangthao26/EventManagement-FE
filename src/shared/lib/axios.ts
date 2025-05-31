import axios from 'axios';
import { getSession } from 'next-auth/react';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
        const session = await getSession();
        if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const session = await getSession();
                if (session?.refreshToken) {
                    const response = await axiosInstance.post('/auth/refresh', {
                        refreshToken: session.refreshToken
                    });
                    const { accessToken } = response.data;
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch (error) {
                // Handle refresh token error
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 