import { useSession } from "next-auth/react";
import { useState } from "react";

// Custom hook for making authenticated API calls
export function useApi() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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
        setError(null);

        try {
            // Set default headers
            const headers = new Headers(options.headers);

            // If session exists, add authorization header
            if (session) {
                // For JWT-based auth
                headers.set("Authorization", `Bearer ${session?.accessToken}`);

                // You might also want to add role for role-based backend verification
                // headers.set("X-User-Role", session.user.role || "");
            }

            // Make the API call
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers,
            });

            // Handle API errors
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || `API error: ${response.status}`
                );
            }

            // Parse and return data
            const data = await response.json();
            return data as T;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        apiCall,
        loading,
        error,
    };
} 