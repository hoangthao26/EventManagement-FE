import { useSession } from "next-auth/react";
import { useState } from "react";

// Custom hook for making authenticated API calls
export function useApi() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState<boolean>(false);

    // Base URL for your API - update this when backend is ready
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://14.225.218.214:8080/api/v1";

    /**
     * Make an authenticated API call to the backend
     */
    const apiCall = async <T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> => {
        setLoading(true);
        try {
            // Set default headers
            const headers = new Headers(options.headers);
            headers.set('Content-Type', 'application/json');

            if (session?.accessToken) {
                headers.set('Authorization', `Bearer ${session.accessToken}`);
            }

            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers,
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return data as T;
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { apiCall, loading };
}