import React from 'react';
import { Button, Input, Checkbox, Space, Form, Popconfirm, Collapse, Radio, DatePicker, theme, Typography, Select, Alert, Tag } from 'antd';
import { PlusCircleOutlined, DeleteOutlined, FontSizeOutlined, CheckCircleOutlined, CheckSquareOutlined, DownOutlined, StarFilled, MenuOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import Sortable from 'sortablejs';
import { nanoid } from 'nanoid';
import type { SurveyCreate, SurveyQuestion, SurveyOption } from '../model/types';
import { EVENT_STATUS_COLORS } from '@/features/event-management/list/lib/constants';
import type { EventStatus } from '@/features/event-management/list/model/types';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const { Text } = Typography;

const QUESTION_TYPE_OPTIONS = [
    { label: 'Câu hỏi dạng văn bản', value: 'TEXT', icon: <FontSizeOutlined /> },
    { label: 'Một lựa chọn (Radio)', value: 'RADIO', icon: <CheckCircleOutlined /> },
    { label: 'Nhiều lựa chọn (Checkbox)', value: 'CHECKBOX', icon: <CheckSquareOutlined /> },
    { label: 'Dropdown', value: 'DROPDOWN', icon: <DownOutlined /> },
    { label: 'Đánh giá (Rating)', value: 'RATING', icon: <StarFilled style={{ color: '#faad14' }} /> },
];

const SURVEY_STATUS_COLORS = {
    'DRAFT': '#faad14',
    'OPENED': '#52c41a',
    'CLOSED': '#1890ff'
};

interface SurveyFormProps {
    initialValues?: Partial<SurveyCreate>;
    onSubmit: (values: SurveyCreate) => void | Promise<void>;
    mode: 'create' | 'update';
    eventDetail: any;
    createdAt: Date | Dayjs;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({ initialValues = {}, onSubmit, mode, eventDetail, createdAt }) => {
    const [form] = Form.useForm();
    const [questions, setQuestions] = React.useState<SurveyQuestion[]>(initialValues.questions || []);
    const [activeKey, setActiveKey] = React.useState<string | string[]>(questions.length > 0 ? [String(questions[0].orderNum)] : []);
    const collapseRef = React.useRef<HTMLDivElement>(null);
    // State cho lỗi động của câu hỏi
    const [questionErrors, setQuestionErrors] = React.useState<string[]>([]);
    const isFormDisabled = initialValues?.status === 'OPENED' || initialValues?.status === 'CLOSED';

    // Normalize initialValues for Form (convert date strings to dayjs)
    const normalizedInitialValues = {
        ...initialValues,
        startTime: initialValues.startTime ? dayjs(initialValues.startTime) : undefined,
        endTime: initialValues.endTime ? dayjs(initialValues.endTime) : undefined,
    };

    React.useEffect(() => {
        // Drag & Drop setup
        if (!collapseRef.current) return;
        const el = collapseRef.current.querySelector('.ant-collapse > .ant-collapse-item')?.parentElement;
        if (!el) return;
        if ((el as any)._sortable) return; // prevent re-init
        const sortable = Sortable.create(el, {
            handle: '.drag-handle',
            animation: 200,
            onEnd: (evt) => {
                if (evt.oldIndex === undefined || evt.newIndex === undefined || evt.oldIndex === evt.newIndex) return;
                setQuestions(prevQuestions => {
                    const newQuestions = [...prevQuestions];
                    const moved = newQuestions.splice(evt.oldIndex as number, 1)[0];
                    newQuestions.splice(evt.newIndex as number, 0, moved);
                    const reordered = newQuestions.map((q, i) => ({ ...q, orderNum: i + 1 }));
                    return reordered;
                });
            },
        });
        (el as any)._sortable = sortable;
        return () => {
            sortable.destroy();
            delete (el as any)._sortable;
        };
    }, [questions.length]);

    React.useEffect(() => {
        // Chỉ set form values 1 lần duy nhất khi component mount
        form.setFieldsValue({
            ...initialValues,
            startTime: initialValues.startTime ? dayjs(initialValues.startTime) : undefined,
            endTime: initialValues.endTime ? dayjs(initialValues.endTime) : undefined,
        });

        if (initialValues.questions) {
            setQuestions(initialValues.questions);
        }
    }, []);

    // Survey info change
    const handleSurveyInfoChange = (changed: any, all: any) => {
        // Không setQuestions ở đây, chỉ update các trường khác
    };

    // Question logic
    const handleAdd = (type: string = 'TEXT') => {
        if (isFormDisabled) return;
        const nextOrder = questions.length > 0 ? Math.max(...questions.map(q => q.orderNum)) + 1 : 1;
        const newQ: SurveyQuestion = {
            id: nanoid(),
            question: '',
            orderNum: nextOrder,
            type,
            isRequired: false,
            options: type === 'TEXT' ? undefined : [{ id: nanoid(), text: '', orderNum: 1 }],
        };
        setQuestions([...questions, newQ]);
        setActiveKey([String(newQ.orderNum)]);
    };

    const handleChange = (idx: number, q: Partial<SurveyQuestion>) => {
        if (isFormDisabled) return;
        const newList = questions.map((item, i) =>
            i === idx ? { ...item, ...q } : item
        );
        setQuestions(newList);
    };

    const handleDelete = (idx: number) => {
        if (isFormDisabled) return;
        const deletedOrder = questions[idx].orderNum;
        const newList = questions.filter((_, i) => i !== idx);
        setQuestions(newList);
        setTimeout(() => {
            if (Array.isArray(activeKey) && activeKey.includes(String(deletedOrder))) {
                if (newList.length > 0) setActiveKey([String(newList[0].orderNum)]);
                else setActiveKey([]);
            } else {
                setActiveKey(activeKey);
            }
        }, 0);
    };

    const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
        if (isFormDisabled) return;
        const opts = questions[qIdx].options ? [...questions[qIdx].options!] : [];
        opts[optIdx] = { ...opts[optIdx], text: val };
        handleChange(qIdx, { options: opts });
    };

    const handleAddOption = (qIdx: number) => {
        if (isFormDisabled) return;
        const opts = questions[qIdx].options ? [...questions[qIdx].options!] : [];
        const nextOrder = opts.length > 0 ? Math.max(...opts.map(o => o.orderNum)) + 1 : 1;
        opts.push({ id: nanoid(), text: '', orderNum: nextOrder });
        handleChange(qIdx, { options: opts });
    };

    const handleRemoveOption = (qIdx: number, optIdx: number) => {
        if (isFormDisabled) return;
        const opts = questions[qIdx].options ? questions[qIdx].options!.filter((_, i) => i !== optIdx) : [];
        handleChange(qIdx, { options: opts });
    };

    const handleTypeChange = (idx: number, type: string) => {
        if (isFormDisabled) return;
        handleChange(idx, { type, options: type === 'TEXT' ? undefined : [{ id: nanoid(), text: '', orderNum: 1 }] });
    };

    // Validate và submit
    const handleFinish = async (values: any) => {
        if (isFormDisabled) return;
        let hasError = false;
        setQuestionErrors([]);
        // Validate thời gian
        if (!values.startTime || !values.endTime) {
            form.setFields([
                { name: 'startTime', errors: [!values.startTime ? 'Vui lòng nhập thời gian bắt đầu' : ''] },
                { name: 'endTime', errors: [!values.endTime ? 'Vui lòng nhập thời gian kết thúc' : ''] },
            ]);
            hasError = true;
        } else {
            form.setFields([
                { name: 'startTime', errors: [] },
                { name: 'endTime', errors: [] },
            ]);
        }
        if (values.startTime && values.endTime && dayjs(values.startTime) >= dayjs(values.endTime)) {
            form.setFields([
                { name: 'startTime', errors: ['Thời gian bắt đầu phải trước thời gian kết thúc'] },
                { name: 'endTime', errors: ['Thời gian kết thúc phải sau thời gian bắt đầu'] },
            ]);
            hasError = true;
        }
        if (values.startTime && (dayjs(values.startTime) < dayjs(eventDetail.startTime) || dayjs(values.startTime) >= dayjs(eventDetail.endTime))) {
            form.setFields([
                { name: 'startTime', errors: ['Thời gian bắt đầu khảo sát phải nằm trong khoảng thời gian của sự kiện'] },
            ]);
            hasError = true;
        }
        if (values.startTime && dayjs(values.startTime) < dayjs(createdAt)) {
            form.setFields([
                { name: 'startTime', errors: ['Thời gian bắt đầu khảo sát phải sau thời điểm tạo'] },
            ]);
            hasError = true;
        }
        if (eventDetail.status === 'COMPLETE') {
            form.setFields([
                { name: 'startTime', errors: ['Sự kiện đã hoàn thành, không thể tạo/cập nhật khảo sát'] },
            ]);
            hasError = true;
        }
        if (!values.title || values.title.trim() === '') {
            form.setFields([
                { name: 'title', errors: ['Không được để trống tiêu đề khảo sát'] },
            ]);
            hasError = true;
        }
        // Validate câu hỏi
        let qErrors: string[] = [];
        if (!questions || questions.length === 0) {
            qErrors[0] = 'Cần ít nhất 1 câu hỏi';
            hasError = true;
        } else {
            questions.forEach((q, idx) => {
                if (!q.question || q.question.trim() === '') {
                    qErrors[idx] = 'Không được để trống nội dung câu hỏi';
                    hasError = true;
                } else if ((q.type === 'RADIO' || q.type === 'CHECKBOX' || q.type === 'DROPDOWN') && (!q.options || q.options.length === 0)) {
                    qErrors[idx] = 'Các câu hỏi lựa chọn phải có ít nhất 1 lựa chọn';
                    hasError = true;
                } else if ((q.type === 'RADIO' || q.type === 'CHECKBOX' || q.type === 'DROPDOWN') && q.options) {
                    for (const opt of q.options) {
                        if (!opt.text || opt.text.trim() === '') {
                            qErrors[idx] = 'Không được để trống nội dung lựa chọn';
                            hasError = true;
                            break;
                        }
                    }
                }
            });
        }
        setQuestionErrors(qErrors);
        if (hasError) return;

        // Build payload - giữ nguyên questions với id, API sẽ tự xử lý
        const basePayload = {
            ...values,
            startTime: typeof values.startTime === 'string' ? values.startTime : dayjs(values.startTime).format('YYYY-MM-DDTHH:mm:ss'),
            endTime: typeof values.endTime === 'string' ? values.endTime : dayjs(values.endTime).format('YYYY-MM-DDTHH:mm:ss'),
            questions: questions.map((q, idx) => {
                const baseQuestion = {
                    question: q.question,
                    orderNum: idx + 1,
                    type: q.type,
                    isRequired: q.isRequired,
                    options: (q.type === 'TEXT' || q.type === 'RATING')
                        ? []
                        : (q.options ? q.options.map((opt, oidx) => ({
                            text: opt.text,
                            orderNum: oidx + 1,
                            ...(mode === 'update' && opt.id ? { id: opt.id } : {})
                        })) : [])
                };

                return mode === 'update' && q.id
                    ? { ...baseQuestion, id: q.id }
                    : baseQuestion;
            })
        };

        let payload: SurveyCreate;
        if (mode === 'create') {
            payload = {
                ...basePayload,
                eventId: initialValues.eventId || eventDetail.id,
            };
        } else {
            payload = basePayload as SurveyCreate;
        }

        console.log('Survey request payload:', payload);
        await onSubmit(payload);
    };

    return (
        <div>
            <Alert
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                message={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 16 }}>
                        <span>
                            <b>Thời gian sự kiện:</b> {eventDetail?.startTime ? dayjs(eventDetail.startTime).format('DD/MM/YYYY HH:mm') : '...'}
                            {' '}→{' '}
                            {eventDetail?.endTime ? dayjs(eventDetail.endTime).format('DD/MM/YYYY HH:mm') : '...'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                            <Tag color={EVENT_STATUS_COLORS[eventDetail?.status as EventStatus] || 'default'}
                                style={{ fontSize: 16, padding: '6px 18px', height: 'auto', display: 'flex', alignItems: 'center' }}>
                                {eventDetail?.status}
                            </Tag>
                        </span>
                    </div>
                }
            />

            {mode === 'update' && initialValues && (
                <Alert
                    type="success"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    style={{ marginBottom: 16 }}
                    message={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <div>
                                    <b>Trạng thái khảo sát:</b>
                                    <Tag
                                        color={SURVEY_STATUS_COLORS[initialValues.status as keyof typeof SURVEY_STATUS_COLORS] || 'default'}
                                        style={{ marginLeft: 8 }}
                                    >
                                        {initialValues.status}
                                    </Tag>
                                </div>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    {initialValues.createdAt && (
                                        <span>
                                            <b>Tạo lúc:</b> {dayjs(initialValues.createdAt).format('DD/MM/YYYY HH:mm')}
                                        </span>
                                    )}
                                    {initialValues.updatedAt && (
                                        <span>
                                            <b>Cập nhật lần cuối:</b> {dayjs(initialValues.updatedAt).format('DD/MM/YYYY HH:mm')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    }
                />
            )}

            <Form
                form={form}
                layout="vertical"
                onValuesChange={handleSurveyInfoChange}
                onFinish={handleFinish}
            >
                <Form.Item label={<b style={{ fontSize: 16 }}>Tiêu đề khảo sát</b>} name="title" rules={[{ required: true, message: 'Nhập tiêu đề khảo sát' }]}>
                    <Input placeholder="Nhập tiêu đề khảo sát" size="large" maxLength={100} disabled={isFormDisabled} />
                </Form.Item>
                <Form.Item label={<b style={{ fontSize: 16 }}>Mô tả</b>} name="description">
                    <Input.TextArea placeholder="Mô tả khảo sát" size="large" maxLength={350} disabled={isFormDisabled} />
                </Form.Item>
                <Space style={{ width: '100%' }}>
                    <Form.Item label={<b style={{ fontSize: 16 }}>Thời gian bắt đầu</b>} name="startTime" rules={[{ required: true, message: 'Chọn thời gian bắt đầu' }]}>
                        <DatePicker showTime size="large" style={{ width: 220 }} format="YYYY-MM-DD HH:mm" disabled={isFormDisabled} />
                    </Form.Item>
                    <Form.Item label={<b style={{ fontSize: 16 }}>Thời gian kết thúc</b>} name="endTime" rules={[{ required: true, message: 'Chọn thời gian kết thúc' }]}>
                        <DatePicker showTime size="large" style={{ width: 220 }} format="YYYY-MM-DD HH:mm" disabled={isFormDisabled} />
                    </Form.Item>
                </Space>
                <div style={{ margin: '24px 0 8px 0', fontWeight: 600, fontSize: 16 }}>Danh sách câu hỏi</div>
                <div ref={collapseRef}>
                    <Collapse
                        accordion
                        activeKey={activeKey}
                        onChange={(key: string | string[]) => setActiveKey(key)}
                        style={{ background: 'transparent' }}
                        bordered={false}
                        expandIcon={() => null}
                    >
                        {questions.map((q, idx) => (
                            <Panel
                                key={q.id}
                                header={
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <span className="drag-handle" style={{ cursor: 'grab', marginRight: 16, fontSize: 20 }}><MenuOutlined /></span>
                                        <Text strong style={{ fontSize: 16, flex: 1, textAlign: 'left' }}>{`Câu ${idx + 1}`}</Text>
                                        <Text type="secondary" style={{ fontSize: 14, flex: 2, textAlign: 'left', marginLeft: 8 }}>
                                            {QUESTION_TYPE_OPTIONS.find(opt => opt.value === q.type)?.icon} {QUESTION_TYPE_OPTIONS.find(opt => opt.value === q.type)?.label}
                                        </Text>
                                        <div style={{ marginLeft: 'auto' }}>
                                            <Popconfirm title="Xóa câu hỏi này?" onConfirm={(e?: React.MouseEvent<HTMLElement>) => { e?.stopPropagation(); handleDelete(idx); }} onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}>
                                                <Button danger size="small" icon={<DeleteOutlined />} onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()} disabled={isFormDisabled} />
                                            </Popconfirm>
                                        </div>
                                    </div>
                                }
                                style={{
                                    background: activeKey?.includes(String(q.orderNum)) ? '#fff' : '#fff',
                                    border: '1px solid rgb(211, 200, 188)',
                                    borderRadius: 12,
                                    marginBottom: 16,
                                    boxShadow: activeKey?.includes(String(q.orderNum)) ? '0 0 0 1px #fa8c16' : undefined,
                                }}
                                forceRender
                            >
                                <Form.Item label={<b>Loại câu hỏi</b>} style={{ marginBottom: 12 }}>
                                    <Select
                                        value={q.type}
                                        onChange={(value: string) => handleTypeChange(idx, value)}
                                        style={{ width: 260 }}
                                        optionLabelProp="label"
                                        disabled={isFormDisabled}
                                    >
                                        {QUESTION_TYPE_OPTIONS.map(opt => (
                                            <Select.Option key={opt.value} value={opt.value} label={
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    {opt.icon}
                                                    {opt.label}
                                                </span>
                                            }>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    {opt.icon}
                                                    {opt.label}
                                                </span>
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item label={'Câu hỏi'} required style={{ marginBottom: 12 }} validateStatus={questionErrors[idx] ? 'error' : ''} help={questionErrors[idx] || ''}>
                                    <Input
                                        value={q.question}
                                        maxLength={100}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(idx, { question: e.target.value })}
                                        placeholder="Nhập câu hỏi"
                                        size="large"
                                        style={{ borderRadius: 8 }}
                                        disabled={isFormDisabled}
                                    />
                                </Form.Item>
                                <Form.Item style={{ marginBottom: 12 }}>
                                    <Checkbox
                                        checked={q.isRequired}
                                        disabled={isFormDisabled}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(idx, { isRequired: e.target.checked })}
                                    >Yêu cầu trả lời</Checkbox>
                                </Form.Item>
                                {(q.type === 'RADIO' || q.type === 'CHECKBOX' || q.type === 'DROPDOWN') && (
                                    <Form.Item label="Các lựa chọn" style={{ marginBottom: 12 }} validateStatus={questionErrors[idx] ? 'error' : ''} help={questionErrors[idx] || ''}>
                                        {q.options && q.options.map((opt: SurveyOption, optIdx: number) => (
                                            <Space key={optIdx} style={{ display: 'flex', marginBottom: 8 }}>
                                                <Input
                                                    value={opt.text}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOptionChange(idx, optIdx, e.target.value)}
                                                    placeholder={`Lựa chọn ${optIdx + 1}`}
                                                    style={{ width: 300, borderRadius: 8 }}
                                                    size="large"
                                                    disabled={isFormDisabled}
                                                />
                                                <Button onClick={() => handleRemoveOption(idx, optIdx)} disabled={q.options!.length <= 1 || isFormDisabled} danger >Xóa</Button>
                                            </Space>
                                        ))}
                                        <Button onClick={() => handleAddOption(idx)} style={{ marginTop: 8 }} icon={<PlusCircleOutlined />}>Thêm lựa chọn</Button>
                                    </Form.Item>
                                )}
                            </Panel>
                        ))}
                    </Collapse>
                </div>
                <div style={{ textAlign: 'center', marginTop: 32, background: '#fff', borderRadius: 12 }}>
                    <Button
                        type="primary"
                        icon={<PlusCircleOutlined />}
                        size="large"
                        style={{ borderRadius: 8, background: '#fa8c16', border: 'none', fontWeight: 600, fontSize: 18 }}
                        onClick={() => handleAdd('TEXT')}
                        disabled={isFormDisabled}
                    >
                        Tạo câu hỏi
                    </Button>
                </div>
                <Form.Item style={{ marginTop: 32, textAlign: 'right' }}>
                    <Button type="primary" htmlType="submit" size="large" disabled={isFormDisabled}>
                        {mode === 'create' ? 'Tạo khảo sát' : 'Cập nhật khảo sát'}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}; 