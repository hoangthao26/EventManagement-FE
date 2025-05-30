import axios from 'axios';
import { getSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';

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

        // Nếu là request refresh token thì không retry
        if (originalRequest.url === '/auth/refresh') {
            await signOut({ redirect: true, callbackUrl: '/auth/login' });
            return Promise.reject(error);
        }

        // Handle both 401 and 403
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
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
                // If refresh token fails, sign out the user
                await signOut({ redirect: true, callbackUrl: '/auth/login' });
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 