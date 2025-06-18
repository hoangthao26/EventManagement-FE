import React from 'react';
import { Button, Input, Checkbox, Space, Form, Popconfirm, Collapse, Radio, DatePicker, theme, Typography, Select } from 'antd';
import { PlusCircleOutlined, DeleteOutlined, FontSizeOutlined, CheckCircleOutlined, CheckSquareOutlined, DownOutlined, StarFilled, MenuOutlined } from '@ant-design/icons';
import { SurveyQuestion, SurveyQuestionType, SurveyOption, SurveyFormData } from '../model/types';
import dayjs from 'dayjs';
import Sortable from 'sortablejs';
import { nanoid } from 'nanoid';

const { Panel } = Collapse;
const { Text } = Typography;

const QUESTION_TYPE_OPTIONS = [
    { label: 'Câu hỏi dạng văn bản', value: 'TEXT', icon: <FontSizeOutlined /> },
    { label: 'Một lựa chọn (Radio)', value: 'RADIO', icon: <CheckCircleOutlined /> },
    { label: 'Nhiều lựa chọn (Checkbox)', value: 'CHECKBOX', icon: <CheckSquareOutlined /> },
    { label: 'Dropdown', value: 'DROPDOWN', icon: <DownOutlined /> },
    { label: 'Đánh giá (Rating)', value: 'RATING', icon: <StarFilled style={{ color: '#faad14' }} /> },
];

interface CreateSurveyFormProps {
    value: Partial<SurveyFormData>;
    onChange: (data: Partial<SurveyFormData>) => void;
}

export const CreateSurveyForm: React.FC<CreateSurveyFormProps> = ({ value = {}, onChange }) => {
    const [form] = Form.useForm();
    const [questions, setQuestions] = React.useState<SurveyQuestion[]>(value.questions || []);
    const [activeKey, setActiveKey] = React.useState<string | string[]>(questions.length > 0 ? [String(questions[0].orderNum)] : []);
    const { token } = theme.useToken();
    const collapseRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        onChange({ ...value, questions });
        // eslint-disable-next-line
    }, [questions]);

    // Drag & Drop setup
    React.useEffect(() => {
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
                    console.log('Questions sau khi kéo:', reordered);
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

    // Survey info change
    const handleSurveyInfoChange = (changed: any, all: any) => {
        onChange({ ...all, questions });
    };

    // Question logic
    const handleAdd = (type: SurveyQuestionType = 'TEXT') => {
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
        const newList = questions.map((item, i) =>
            i === idx ? { ...item, ...q } : item
        );
        setQuestions(newList);
    };

    const handleDelete = (idx: number) => {
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
        const opts = questions[qIdx].options ? [...questions[qIdx].options!] : [];
        opts[optIdx] = { ...opts[optIdx], text: val };
        handleChange(qIdx, { options: opts });
    };

    const handleAddOption = (qIdx: number) => {
        const opts = questions[qIdx].options ? [...questions[qIdx].options!] : [];
        const nextOrder = opts.length > 0 ? Math.max(...opts.map(o => o.orderNum)) + 1 : 1;
        opts.push({ id: nanoid(), text: '', orderNum: nextOrder });
        handleChange(qIdx, { options: opts });
    };

    const handleRemoveOption = (qIdx: number, optIdx: number) => {
        const opts = questions[qIdx].options ? questions[qIdx].options!.filter((_, i) => i !== optIdx) : [];
        handleChange(qIdx, { options: opts });
    };

    const handleTypeChange = (idx: number, type: SurveyQuestionType) => {
        handleChange(idx, { type, options: type === 'TEXT' ? undefined : [{ id: nanoid(), text: '', orderNum: 1 }] });
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={value}
            onValuesChange={handleSurveyInfoChange}
        >
            <Form.Item label={<b>Tiêu đề khảo sát</b>} name="title" rules={[{ required: true, message: 'Nhập tiêu đề khảo sát' }]}>
                <Input placeholder="Nhập tiêu đề khảo sát" maxLength={100} />
            </Form.Item>
            <Form.Item label={<b>Mô tả</b>} name="description">
                <Input.TextArea placeholder="Mô tả khảo sát" maxLength={250} autoSize />
            </Form.Item>
            <Space style={{ width: '100%' }}>
                <Form.Item label={<b>Thời gian bắt đầu</b>} name="startTime" rules={[{ required: true, message: 'Chọn thời gian bắt đầu' }]}>
                    <DatePicker showTime style={{ width: 180 }} format="YYYY-MM-DDTHH:mm:ss.SSS[Z]" />
                </Form.Item>
                <Form.Item label={<b>Thời gian kết thúc</b>} name="endTime" rules={[{ required: true, message: 'Chọn thời gian kết thúc' }]}>
                    <DatePicker showTime style={{ width: 180 }} format="YYYY-MM-DDTHH:mm:ss.SSS[Z]" />
                </Form.Item>
            </Space>
            <div style={{ margin: '24px 0 8px 0', fontWeight: 600 }}>Danh sách câu hỏi</div>
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
                                            <Button danger size="small" icon={<DeleteOutlined />} onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()} />
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
                                    onChange={(value: string) => handleTypeChange(idx, value as SurveyQuestionType)}
                                    style={{ width: 260 }}
                                    optionLabelProp="label"
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
                            <Form.Item label={'Câu hỏi'} required style={{ marginBottom: 12 }}>
                                <Input
                                    value={q.question}
                                    maxLength={100}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(idx, { question: e.target.value })}
                                    placeholder="Nhập câu hỏi"
                                    size="large"
                                    style={{ borderRadius: 8 }}
                                />
                            </Form.Item>
                            <Form.Item style={{ marginBottom: 12 }}>
                                <Checkbox
                                    checked={q.isRequired}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(idx, { isRequired: e.target.checked })}
                                >Yêu cầu trả lời</Checkbox>
                            </Form.Item>
                            {(q.type === 'RADIO' || q.type === 'CHECKBOX' || q.type === 'DROPDOWN') && (
                                <Form.Item label="Các lựa chọn" style={{ marginBottom: 12 }}>
                                    {q.options && q.options.map((opt: SurveyOption, optIdx: number) => (
                                        <Space key={optIdx} style={{ display: 'flex', marginBottom: 8 }}>
                                            <Input
                                                value={opt.text}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOptionChange(idx, optIdx, e.target.value)}
                                                placeholder={`Lựa chọn ${optIdx + 1}`}
                                                style={{ width: 300, borderRadius: 8 }}
                                                size="large"
                                            />
                                            <Button onClick={() => handleRemoveOption(idx, optIdx)} disabled={q.options!.length <= 1} danger>Xóa</Button>
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
                >
                    Tạo câu hỏi
                </Button>
            </div>
        </Form >
    );
}; 