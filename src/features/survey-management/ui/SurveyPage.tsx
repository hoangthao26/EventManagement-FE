import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { message, Button, Popconfirm, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { SurveyForm } from './SurveyForm';
import { getEventDetail } from '../api/surveyApi';
import { getSurvey, createSurvey, updateSurvey, deleteSurvey } from '../api/surveyApi';
import type { SurveyCreate } from '../model/types';
import Loading from '@/shared/ui/Loading';
import { useAuth } from '@/features/auth/model/useAuth';
import { useAntdMessage } from '@/shared/lib/hooks/useAntdMessage';

export default function SurveyPage() {
    const params = useParams() as { departmentCode: string; eventId: string };
    const { departmentCode, eventId } = params;
    const [eventDetail, setEventDetail] = useState<any>(null);
    const [survey, setSurvey] = useState<SurveyCreate | null>(null);
    const [loading, setLoading] = useState(true);
    const [createdAt, setCreatedAt] = useState<Date>(new Date());
    const [formKey, setFormKey] = useState<number>(0); // Key để force re-render form
    const { session } = useAuth();
    const { showSuccess, showError } = useAntdMessage();

    // Kiểm tra xem user có phải là Head của department này không
    const isHeadOfDepartment = () => {
        const userDepartmentRoles = session?.user?.userDepartmentRoles || [];
        return userDepartmentRoles.some(role =>
            role.departmentCode === departmentCode && role.roleName === 'HEAD'
        );
    };

    // Kiểm tra xem có thể xóa survey không
    const canDeleteSurvey = () => {
        if (!survey) return false;
        if (survey.status !== 'DRAFT') return false;
        return isHeadOfDepartment();
    };

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
                showError('Không lấy được thông tin sự kiện');
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
                showSuccess('Cập nhật khảo sát thành công');
                // Sau khi update, lấy lại survey mới nhất
                const updated = await getSurvey(eventId);
                setSurvey(updated);
            } else {
                await createSurvey(departmentCode, values);
                showSuccess('Tạo khảo sát thành công');
                // Sau khi tạo, lấy lại survey mới nhất
                const created = await getSurvey(eventId);
                setSurvey(created);
            }
        } catch (err: any) {
            showError(err?.message || 'Lỗi khi lưu khảo sát');
        }
    };

    const handleDeleteSurvey = async () => {
        if (!survey || !(survey as any).id) {
            showError('Không tìm thấy survey để xóa');
            return;
        }

        try {
            await deleteSurvey((survey as any).id, departmentCode, eventId);
            showSuccess('Xóa khảo sát thành công');
            setSurvey(null);
            // Reset form bằng cách thay đổi key
            setFormKey(prev => prev + 1);
        } catch (err: any) {
            showError(err?.message || 'Lỗi khi xóa khảo sát');
        }
    };

    const renderDeleteButton = () => {
        if (!survey) return null;

        const isHead = isHeadOfDepartment();
        const isDraft = survey.status === 'DRAFT';
        const canDelete = canDeleteSurvey();

        let tooltipText = '';
        if (!isHead) {
            tooltipText = 'Chỉ có Head của department mới được xóa khảo sát';
        } else if (!isDraft) {
            tooltipText = 'Chỉ có thể xóa khảo sát ở trạng thái DRAFT';
        }

        const deleteButton = (
            <Popconfirm
                title="Xóa khảo sát"
                description="Bạn có chắc chắn muốn xóa khảo sát này không?"
                onConfirm={handleDeleteSurvey}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    disabled={!canDelete}
                    style={{
                        cursor: canDelete ? 'pointer' : 'not-allowed',
                        marginBottom: 16
                    }}
                >
                    Xóa khảo sát
                </Button>
            </Popconfirm>
        );

        if (tooltipText) {
            return (
                <Tooltip title={tooltipText}>
                    <div style={{ display: 'inline-block' }}>
                        {deleteButton}
                    </div>
                </Tooltip>
            );
        }

        return deleteButton;
    };

    return (
        <div>
            {renderDeleteButton()}
            <SurveyForm
                key={formKey} // Force re-render khi survey bị xóa
                initialValues={survey || undefined}
                onSubmit={handleSubmit}
                mode={survey ? 'update' : 'create'}
                eventDetail={eventDetail}
                createdAt={createdAt}
            />
        </div>
    );
} 