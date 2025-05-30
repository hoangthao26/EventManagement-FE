'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAntdMessage } from '@/shared/lib/hooks/useAntdMessage';
import { CreateEventForm } from '../../create/ui/CreateEventForm';
import { getEventDetails, updateEvent } from '../model/api';
import { EventDetailsResponse, UpdateEventPayload } from '../model/types';
import { Spin } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

interface UpdateEventFormProps {
    departmentCode: string;
    eventId: number;
    departments: { departmentName: string; departmentCode: string }[];
}

export function UpdateEventForm({ departmentCode, eventId, departments }: UpdateEventFormProps) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [eventData, setEventData] = useState<EventDetailsResponse | null>(null);
    const router = useRouter();
    const { showSuccess, showError } = useAntdMessage();

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const data = await getEventDetails(departmentCode, eventId);
                setEventData(data);
            } catch (error) {
                console.error('Error fetching event details:', error);
                showError('Failed to fetch event details');
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [departmentCode, eventId]);

    const handleSubmit = async (data: any) => {
        try {
            setSubmitting(true);
            const payload = { ...data };
            delete payload.departmentCode;

            console.log('Update event payload:', payload);
            await updateEvent(departmentCode, eventId, payload);
            showSuccess('Event updated successfully!');
            router.push('/organizer/my-events');
        } catch (error) {
            console.error('Error updating event:', error);
            showError('Failed to update event');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!eventData) {
        return null;
    }

    // Transform event data to match form initial values
    const initialValues = {
        name: eventData.name,
        typeId: eventData.typeId,
        tags: eventData.tags.map(tag => tag.id),
        audience: eventData.audience,
        studentCapacity: eventData.maxCapacityStudent,
        lecturerCapacity: eventData.maxCapacityLecturer,
        mode: eventData.mode,
        address: eventData.location?.address,
        ward: eventData.location?.ward,
        district: eventData.location?.district,
        city: eventData.location?.city,
        platformName: eventData.platform?.name,
        platformUrl: eventData.platform?.url,
        timeRange: [dayjs.utc(eventData.startTime).local(), dayjs.utc(eventData.endTime).local()],
        registrationTimeRange: [dayjs.utc(eventData.registrationStart).local(), dayjs.utc(eventData.registrationEnd).local()],
        poster: eventData.posterUrl,
        banner: eventData.bannerUrl,
        imageUrls: eventData.images.map(img => img.url),
        description: eventData.description,
    };

    return (
        <CreateEventForm
            onSubmit={handleSubmit}
            loading={submitting}
            departments={departments}
            initialValues={initialValues}
            isUpdate={true}
        />
    );
}