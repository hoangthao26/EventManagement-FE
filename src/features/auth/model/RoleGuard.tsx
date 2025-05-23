"use client";

import { useAuth } from "@/features/auth/model/useAuth";
import { UserRole } from "@/types/next-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { session, status, hasAnyRole, redirectBasedOnRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (!session) {
            router.push("/login");
            return;
        }

        if (!hasAnyRole(allowedRoles)) {
            router.push("/unauthorized");
            return;
        }

        redirectBasedOnRole();
    }, [session, status, router, allowedRoles, hasAnyRole, redirectBasedOnRole]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!session || !hasAnyRole(allowedRoles)) {
        return null;
    }

    return <>{children}</>;
} 