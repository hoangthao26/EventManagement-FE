import axios from 'axios';
import { getSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { jwtDecode } from 'jwt-decode';

// Biến để tránh vòng lặp khi refresh token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Kiểm tra token hết hạn
const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwtDecode<{ exp: number }>(token);
        const expiry = decoded.exp * 1000;
        const now = Date.now();
        return now >= expiry;
    } catch (error) {
        return true;
    }
};

// Kiểm tra token cần refresh (30 phút trước khi hết hạn)
const shouldRefreshToken = (token: string): boolean => {
    try {
        const decoded = jwtDecode<{ exp: number }>(token);
        const expiry = decoded.exp * 1000;
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;
        return now >= expiry - thirtyMinutes;
    } catch (error) {
        return true;
    }
};

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
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const session = await getSession();
                if (session?.refreshToken) {
                    const response = await axiosInstance.post('/auth/refresh', {
                        refreshToken: session.refreshToken
                    });
                    const { accessToken } = response.data;

                    processQueue(null, accessToken);
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch (error) {
                processQueue(error, null);
                await signOut({ redirect: true, callbackUrl: '/login' });
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 