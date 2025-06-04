'use client';

import { UpdateEventForm } from '@/features/event-management/update/ui/UpdateEventForm';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/widgets/layouts/ui/DashboardLayout';

export default function UpdateEventPage() {
    const params = useParams();
    const departmentCode = params.departmentCode as string;
    const eventId = parseInt(params.eventId as string);

    return (
        <DashboardLayout>
            <div style={{ padding: '16px' }}>
                <UpdateEventForm
                    departmentCode={departmentCode}
                    eventId={eventId}
                    departments={[{ departmentCode, departmentName: departmentCode }]} // Pass current department
                />
            </div>
        </DashboardLayout>
    );
} 