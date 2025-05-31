'use client';

import { useEffect, useState } from 'react';
import { CreateEventForm } from '@/features/event-management/create/ui/CreateEventForm';
import { createEvent } from '@/features/event-management/create/api';
import { message } from 'antd';
import { useRouter } from 'next/navigation';
import type { CreateEventData } from '@/features/event-management/create/model/types';
import { useAuth } from '@/features/auth/model/useAuth';
import Loading from '@/shared/ui/Loading';
import DashboardLayout from '@/widgets/layouts/ui/DashboardLayout';

export default function CreateEventPage() {
    const router = useRouter();
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

    const handleSubmit = async (data: CreateEventData) => {
        try {
            setLoading(true);
            await createEvent(data);
            message.success('Event created successfully');
            router.push('/organizer');
        } catch (error) {
            message.error('Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div style={{ padding: '16px' }}>
                <CreateEventForm
                    onSubmit={handleSubmit}
                    loading={loading}
                    departments={session?.user?.userDepartmentRoles?.map(role => ({
                        departmentName: role.departmentName,
                        departmentCode: role.departmentCode
                    })) || []}
                />
            </div>
        </DashboardLayout>
    );
} 