"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/features/auth/model/useAuth";
import AppLayout from "@/components/AppLayout";
import Loading from "@/components/Loading";

export default function LecturerPage() {
    const { session, status } = useAuth();

    if (status === "loading") {
        return <Loading />;
    }

    return (
        <RoleGuard allowedRoles={["LECTURER"]}>
            <AppLayout>
                <div className="container mx-auto p-4">
                    <h1 className="text-2xl font-bold mb-4">Lecturer Dashboard</h1>
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Welcome, {session?.user?.name}
                        </h2>
                        <p className="text-gray-600">
                            This is a protected lecturer page. Only users with the LECTURER role can access this page.
                        </p>
                    </div>
                </div>
            </AppLayout>
        </RoleGuard>
    );
} 