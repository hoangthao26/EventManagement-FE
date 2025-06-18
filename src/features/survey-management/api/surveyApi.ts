import axios from '@/shared/lib/axios';
import type { SurveyCreate, SurveyCreateRequest, SurveyUpdateRequest } from '../model/types';

// Helper function để debug id types
function debugIdTypes(data: SurveyCreate) {
    console.log('=== Debug ID Types ===');
    data.questions.forEach((q, idx) => {
        console.log(`Question ${idx + 1}:`, {
            id: q.id,
            idType: typeof q.id,
            isNumber: typeof q.id === 'number',
            isString: typeof q.id === 'string'
        });
        if (q.options) {
            q.options.forEach((opt, optIdx) => {
                console.log(`  Option ${optIdx + 1}:`, {
                    id: opt.id,
                    idType: typeof opt.id,
                    isNumber: typeof opt.id === 'number',
                    isString: typeof opt.id === 'string'
                });
            });
        }
    });
    console.log('=== End Debug ===');
}

// Helper function để loại bỏ id khi create
function prepareCreatePayload(data: SurveyCreate): SurveyCreateRequest {
    return {
        ...data,
        questions: data.questions.map((q, idx) => ({
            question: q.question,
            orderNum: idx + 1,
            type: q.type,
            isRequired: q.isRequired,
            options: (q.type === 'TEXT' || q.type === 'RATING')
                ? []
                : (q.options ? q.options.map((opt, oidx) => ({
                    text: opt.text,
                    orderNum: oidx + 1
                })) : [])
        }))
    };
}

// Helper function để giữ id khi update
function prepareUpdatePayload(data: SurveyCreate): SurveyUpdateRequest {
    debugIdTypes(data);

    return {
        eventId: data.eventId,
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        questions: data.questions.map((q, idx) => ({
            // Chỉ gửi id nếu nó là number (từ backend), không gửi string id (từ nanoid)
            ...(typeof q.id === 'number' ? { id: q.id } : {}),
            question: q.question,
            orderNum: idx + 1,
            type: q.type,
            isRequired: q.isRequired,
            options: (q.type === 'TEXT' || q.type === 'RATING')
                ? []
                : (q.options ? q.options.map((opt, oidx) => ({
                    // Chỉ gửi id nếu nó là number (từ backend), không gửi string id (từ nanoid)
                    ...(typeof opt.id === 'number' ? { id: opt.id } : {}),
                    text: opt.text,
                    orderNum: oidx + 1
                })) : [])
        }))
    };
}

export async function createSurvey(departmentCode: string, data: SurveyCreate) {
    const payload = prepareCreatePayload(data);
    const res = await axios.post(`/surveys?departmentCode=${departmentCode}`, payload);
    if (res.status !== 201) throw new Error('Tạo khảo sát thất bại');
    return res.data;
}

export async function getEventDetail(departmentCode: string, eventId: string | number) {
    const res = await axios.get(`/events/management/${departmentCode}/event/${eventId}`);
    if (res.status !== 200) throw new Error('Không lấy được thông tin sự kiện');
    return res.data;
}

export async function getSurvey(eventId: string | number): Promise<SurveyCreate> {
    const res = await axios.get(`/surveys/events/${eventId}/survey`);
    if (res.status !== 200) throw new Error('Không tìm thấy survey');
    return res.data;
}

export async function updateSurvey(surveyId: number, departmentCode: string, data: SurveyCreate) {
    const payload = prepareUpdatePayload(data);
    console.log('Update survey payload:', JSON.stringify(payload, null, 2));
    const res = await axios.put(`/surveys/${surveyId}?departmentCode=${departmentCode}`, payload);
    if (res.status !== 200) throw new Error('Cập nhật khảo sát thất bại');
    return res.data;
}

export async function deleteSurvey(surveyId: number, departmentCode: string, eventId: string | number) {
    const res = await axios.delete(`/surveys/${surveyId}?eventId=${eventId}&departmentCode=${departmentCode}`);
    if (res.status !== 200) throw new Error('Xóa khảo sát thất bại');
    return res.data;
}