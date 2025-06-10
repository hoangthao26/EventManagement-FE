'use client';
import React, { useState } from 'react';
import { CreateSurveyForm } from '@/features/create-survey/ui/CreateSurveyForm';
import { SurveyQuestion } from '@/features/create-survey/model/types';
import { useParams } from 'next/navigation';
import { Button, Typography, message } from 'antd';

const { Title } = Typography;

const SurveyPage = () => {
    const params = useParams();
    const eventId = Number(params?.eventId);
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        // TODO: Gọi API lưu khảo sát ở đây
        setTimeout(() => {
            setLoading(false);
            message.success('Lưu khảo sát thành công!');
        }, 1000);
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
            <Title level={3}>Tạo khảo sát cho sự kiện</Title>
            <CreateSurveyForm value={questions} onChange={setQuestions} />
            <div style={{ marginTop: 24, textAlign: 'right' }}>
                <Button type="primary" onClick={handleSave} loading={loading} disabled={questions.length === 0}>
                    Lưu khảo sát
                </Button>
            </div>
        </div>
    );
};

export default SurveyPage; 