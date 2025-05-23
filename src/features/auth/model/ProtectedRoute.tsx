import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@/types/next-auth";
import { hasAnyRole } from "@/features/auth/model/auth";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (!session) {
            router.push("/login");
            return;
        }

        if (!hasAnyRole(session, allowedRoles)) {
            router.push("/unauthorized");
            return;
        }
    }, [session, status, router, allowedRoles]);

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    if (!session) {
        return null;
    }

    if (!hasAnyRole(session, allowedRoles)) {
        return null;
    }

    return <>{children}</>;
} 