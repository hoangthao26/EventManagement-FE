'use client';

import { useAuth } from '@/features/auth/model/useAuth';
import { EventMembers } from '@/features/event-management/members/ui/EventMembers';
import { useState } from 'react';
import Loading from '@/shared/ui/Loading';
import DashboardLayout from '@/widgets/layouts/ui/DashboardLayout';
import { useEffect } from 'react';

interface EventMembersPageProps {
    params: {
        departmentCode: string;
        eventId: string;
    };
}

export default function EventMembersPage({ params }: EventMembersPageProps) {
    const [loading, setLoading] = useState(false);
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
                <EventMembers
                    departmentCode={params.departmentCode}
                    eventId={parseInt(params.eventId)}
                />
            </div>
        </DashboardLayout >
    );
} 