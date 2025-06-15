'use client';

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { jwtDecode } from "jwt-decode";

function SessionHandler({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated" && session?.accessToken) {
            try {
                const decoded = jwtDecode<{ exp: number }>(session.accessToken);
                const expiry = decoded.exp * 1000;
                const now = Date.now();

                // If token is expired or will expire in next 5 minutes
                if (now >= expiry - 5 * 60 * 1000) {
                    // Force logout
                    router.push("/login");
                }
            } catch (error) {
                console.error("Token validation error:", error);
                router.push("/login");
            }
        }
    }, [session, status, router]);

    return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SessionHandler>{children}</SessionHandler>
        </SessionProvider>
    );
} 