'use client';
import React from 'react';
import DashboardLayout from '@/widgets/layouts/ui/DashboardLayout';
import SurveyPage from '@/features/survey-management/ui/SurveyPage';

const SurveyWrapper = () => {
    return (
        <DashboardLayout>
            <div style={{ padding: '16px' }}>
                <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
                    <SurveyPage />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SurveyWrapper; 