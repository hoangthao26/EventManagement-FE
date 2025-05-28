'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/model/useAuth';
import { EventList } from '@/features/event-management/list/ui/EventList';
import DashboardLayout from '@/widgets/layouts/ui/DashboardLayout';
import Loading from '@/shared/ui/Loading';

export default function EventsPage() {
    const { session, status } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            window.location.href = "/login";
        }
        setLoading(false);
    }, [status]);

    if (status === "loading" || loading) {
        return <Loading />;
    }

    const userDepartmentRoles = session?.user?.userDepartmentRoles || [];

    if (userDepartmentRoles.length === 0) {
        return (
            <DashboardLayout>
                <div style={{ padding: '24px', textAlign: 'center' }}>
                    <h2>No Department Access</h2>
                    <p>You don't have access to any department's events.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div style={{ padding: '16px' }}>
                <EventList userDepartmentRoles={userDepartmentRoles} />
            </div>
        </DashboardLayout>
    );
}