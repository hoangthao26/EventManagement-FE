'use client';

import { useAuth } from '@/features/auth/model/useAuth';
import { CheckInList } from '@/features/check-in/ui/CheckInList';
import Loading from '@/shared/ui/Loading';
import DashboardLayout from '@/widgets/layouts/ui/DashboardLayout';
import { useEffect } from 'react';

export default function CheckInPage() {
    const { session, status } = useAuth();
    useEffect(() => {
        if (status === "unauthenticated") {
            window.location.href = "/login";
        }
    }, [status]);

    if (status === "loading") {
        return <Loading />;
    }
    return (
        <DashboardLayout>
            <div style={{ padding: '16px' }}>
                <CheckInList />
            </div>
        </DashboardLayout>
    );
} 