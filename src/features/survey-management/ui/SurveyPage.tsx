import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { message } from 'antd';
import { SurveyForm } from './SurveyForm';
import { getEventDetail } from '../api/surveyApi';
import { getSurvey, createSurvey, updateSurvey } from '../api/surveyApi';
import type { SurveyCreate } from '../model/types';
import Loading from '@/shared/ui/Loading';

export default function SurveyPage() {
    const params = useParams() as { departmentCode: string; eventId: string };
    const { departmentCode, eventId } = params;
    const [eventDetail, setEventDetail] = useState<any>(null);
    const [survey, setSurvey] = useState<SurveyCreate | null>(null);
    const [loading, setLoading] = useState(true);
    const [createdAt, setCreatedAt] = useState<Date>(new Date());

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const event = await getEventDetail(departmentCode, eventId);
                setEventDetail(event);
                try {
                    const draft = await getSurvey(eventId);
                    setSurvey(draft);
                } catch {
                    setSurvey(null); // Chưa có survey
                }
            } catch {
                message.error('Không lấy được thông tin sự kiện');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
        setCreatedAt(new Date());
    }, [departmentCode, eventId]);

    if (loading) return <Loading />;

    const handleSubmit = async (values: SurveyCreate) => {
        try {
            if (survey) {
                const updateData = {
                    ...values,
                    eventId: Number(eventId)
                };
                await updateSurvey((survey as any).id, departmentCode, updateData);
                message.success('Cập nhật khảo sát thành công');
            } else {
                await createSurvey(departmentCode, values);
                message.success('Tạo khảo sát thành công');
            }
        } catch (err: any) {
            message.error(err?.message || 'Lỗi khi lưu khảo sát');
        }
    };

    return (
        <SurveyForm
            initialValues={survey || undefined}
            onSubmit={handleSubmit}
            mode={survey ? 'update' : 'create'}
            eventDetail={eventDetail}
            createdAt={createdAt}
        />
    );
} 