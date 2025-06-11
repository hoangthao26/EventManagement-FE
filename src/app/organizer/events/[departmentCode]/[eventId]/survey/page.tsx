'use client';
import React, { useEffect, useState } from 'react';
import { CreateSurveyForm } from '@/features/create-survey/ui/CreateSurveyForm';
import { SurveyFormData } from '@/features/create-survey/model/types';
import { useParams } from 'next/navigation';
import { Button, Typography, message } from 'antd';
import DashboardLayout from '@/widgets/layouts/ui/DashboardLayout';
import Loading from '@/shared/ui/Loading';
import dayjs from 'dayjs';
import { surveyApi } from '@/entities/survey/api/surveyApi';

const { Title } = Typography;

const SurveyPage = () => {
    const params = useParams();
    const eventId = Number(params?.eventId);
    const departmentCode = params?.departmentCode as string;
    const [survey, setSurvey] = useState<Partial<SurveyFormData>>({ eventId });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!survey.title || !survey.startTime || !survey.endTime || !survey.questions || survey.questions.length === 0) {
            message.error('Vui lòng nhập đầy đủ thông tin khảo sát và ít nhất 1 câu hỏi!');
            return;
        }
        setLoading(true);
        try {
            // Build payload đúng format API
            const payload = {
                eventId,
                title: survey.title,
                description: survey.description || '',
                startTime: typeof survey.startTime === 'string' ? survey.startTime : dayjs(survey.startTime).toISOString(),
                endTime: typeof survey.endTime === 'string' ? survey.endTime : dayjs(survey.endTime).toISOString(),
                questions: survey.questions.map((q, idx) => ({
                    id: q.id,
                    question: q.question,
                    orderNum: q.orderNum ?? idx + 1,
                    type: q.type,
                    isRequired: q.isRequired,
                    options: (q.options || []).map((opt, oidx) => ({
                        text: opt.text,
                        orderNum: opt.orderNum ?? oidx + 1
                    }))
                }))
            };
            // Gọi API qua surveyApi
            await surveyApi.createSurvey(departmentCode, payload);
            message.success('Tạo khảo sát thành công!');
        } catch (error: any) {
            if (error.response) {
                if (error.response.status === 400) {
                    message.error('Dữ liệu không hợp lệ!');
                } else if (error.response.status === 403) {
                    message.error('Bạn không có quyền thực hiện thao tác này!');
                } else {
                    message.error('Có lỗi xảy ra!');
                }
            } else {
                message.error(error.message || 'Không thể kết nối đến máy chủ!');
            }
        } finally {
            setLoading(false);
        }
    };

    // Nếu có logic auth thì giữ lại, nếu không thì bỏ
    // useEffect(() => {
    //     if (status === "unauthenticated") {
    //         window.location.href = "/login";
    //     }
    // }, [status]);

    // if (status === "loading") {
    //     return <Loading />;
    // }

    return (
        <DashboardLayout>
            <div style={{ padding: '16px' }}>
                <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
                    <Title level={3}>Tạo khảo sát cho sự kiện</Title>
                    <CreateSurveyForm value={survey} onChange={setSurvey} />
                    <div style={{ marginTop: 24, textAlign: 'right' }}>
                        <Button type="primary" onClick={handleSave} loading={loading} disabled={!survey.questions || survey.questions.length === 0}>
                            Lưu khảo sát
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout >
    );
};

export default SurveyPage; 