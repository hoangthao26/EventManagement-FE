'use client';

import { UpdateEventForm } from '@/features/event-management/update/ui/UpdateEventForm';
import { useParams } from 'next/navigation';

export default function UpdateEventPage() {
    const params = useParams();
    const departmentCode = params.departmentCode as string;
    const eventId = parseInt(params.eventId as string);

    return (
        <UpdateEventForm
            departmentCode={departmentCode}
            eventId={eventId}
            departments={[{ departmentCode, departmentName: departmentCode }]} // Pass current department
        />
    );
} 