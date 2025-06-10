import React from 'react';
import { Button, Input, Checkbox, Space, Form, Popconfirm, Collapse, Radio, theme, Typography } from 'antd';
import { PlusCircleOutlined, DeleteOutlined, FontSizeOutlined, CheckCircleOutlined, CheckSquareOutlined } from '@ant-design/icons';
import { SurveyQuestion, SurveyQuestionType } from '../model/types';

const { Panel } = Collapse;
const { Text } = Typography;

const QUESTION_TYPE_OPTIONS = [
    { label: 'Câu hỏi dạng văn bản', value: 'TEXT', icon: <FontSizeOutlined /> },
    { label: 'Một câu trả lời', value: 'SINGLE_CHOICE', icon: <CheckCircleOutlined /> },
    { label: 'Nhiều câu trả lời', value: 'MULTIPLE_CHOICE', icon: <CheckSquareOutlined /> },
];

interface CreateSurveyFormProps {
    value: SurveyQuestion[];
    onChange: (questions: SurveyQuestion[]) => void;
}

export const CreateSurveyForm: React.FC<CreateSurveyFormProps> = ({ value, onChange }) => {
    const [nextId, setNextId] = React.useState(
        value.length > 0 ? Math.max(...value.map(q => q.id)) + 1 : 1
    );
    const [activeKey, setActiveKey] = React.useState<string | string[]>(value.length > 0 ? [String(value[0].id)] : []);
    const { token } = theme.useToken();

    const handleAdd = (type: SurveyQuestionType = 'TEXT') => {
        const newQ: SurveyQuestion = {
            id: nextId,
            type,
            question: '',
            description: '',
            required: false,
            options: type === 'TEXT' ? undefined : [''],
        };
        onChange([...value, newQ]);
        setNextId(nextId + 1);
        setActiveKey([String(newQ.id)]);
    };

    const handleChange = (idx: number, q: Partial<SurveyQuestion>) => {
        const newList = value.map((item, i) =>
            i === idx ? { ...item, ...q } : item
        );
        onChange(newList);
    };

    const handleDelete = (idx: number) => {
        const deletedId = value[idx].id;
        const newList = value.filter((_, i) => i !== idx);
        onChange(newList);
        setTimeout(() => {
            if (Array.isArray(activeKey) && activeKey.includes(String(deletedId))) {
                if (newList.length > 0) setActiveKey([String(newList[0].id)]);
                else setActiveKey([]);
            } else {
                setActiveKey(activeKey);
            }
        }, 0);
    };

    const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
        const opts = value[qIdx].options ? [...value[qIdx].options!] : [];
        opts[optIdx] = val;
        handleChange(qIdx, { options: opts });
    };

    const handleAddOption = (qIdx: number) => {
        const opts = value[qIdx].options ? [...value[qIdx].options!, ''] : [''];
        handleChange(qIdx, { options: opts });
    };

    const handleRemoveOption = (qIdx: number, optIdx: number) => {
        const opts = value[qIdx].options ? value[qIdx].options!.filter((_, i) => i !== optIdx) : [];
        handleChange(qIdx, { options: opts });
    };

    const handleTypeChange = (idx: number, type: SurveyQuestionType) => {
        handleChange(idx, { type, options: type === 'TEXT' ? undefined : [''] });
    };

    return (
        <div>
            <Collapse
                accordion
                activeKey={activeKey}
                onChange={(key: string | string[]) => setActiveKey(key)}
                style={{ background: 'transparent' }}
                bordered={false}
            >
                {value.map((q, idx) => (
                    <Panel
                        key={q.id}
                        header={
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
                                    <Text strong style={{ fontSize: 16 }}>{`Câu ${idx + 1}`}</Text>
                                    <Text type="secondary" style={{ fontSize: 14 }}>
                                        {QUESTION_TYPE_OPTIONS.find(opt => opt.value === q.type)?.icon} {QUESTION_TYPE_OPTIONS.find(opt => opt.value === q.type)?.label}
                                    </Text>
                                    <Popconfirm title="Xóa câu hỏi này?" onConfirm={(e?: React.MouseEvent<HTMLElement>) => { e?.stopPropagation(); handleDelete(idx); }} onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}>
                                        <Button danger size="small" icon={<DeleteOutlined />} onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()} />
                                    </Popconfirm>
                                </Space>
                            </Space>
                        }
                        style={{
                            background: activeKey?.includes(String(q.id)) ? '#fff' : '#fff',
                            border: '1px solid rgb(211, 200, 188)',
                            borderRadius: 12,
                            marginBottom: 16,
                            boxShadow: activeKey?.includes(String(q.id)) ? '0 0 0 1px #fa8c16' : undefined,
                        }}
                        forceRender
                    >
                        <Form layout="vertical">
                            <Form.Item label={<b>Loại câu hỏi</b>} style={{ marginBottom: 12, textAlign: 'center' }}>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Radio.Group
                                        value={q.type}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTypeChange(idx, e.target.value as SurveyQuestionType)}
                                        style={{ display: 'flex', gap: 24 }}
                                    >
                                        {QUESTION_TYPE_OPTIONS.map(opt => (
                                            <Radio key={opt.value} value={opt.value} style={{ display: 'flex', alignItems: 'center', height: 32, fontSize: 16 }}>
                                                <Space>
                                                    {opt.icon}
                                                    <span>{opt.label}</span>
                                                </Space>
                                            </Radio>
                                        ))}
                                    </Radio.Group>
                                </div>
                            </Form.Item>
                            <Form.Item label={<span style={{ color: 'red' }}>*</span> + ' Câu hỏi'} required style={{ marginBottom: 12 }}>
                                <Input
                                    value={q.question}
                                    maxLength={100}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(idx, { question: e.target.value })}
                                    placeholder="Nhập câu hỏi"
                                    size="large"
                                    style={{ borderRadius: 8 }}
                                />
                            </Form.Item>
                            <Form.Item label="Mô tả" style={{ marginBottom: 12 }}>
                                <Input
                                    value={q.description}
                                    maxLength={250}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(idx, { description: e.target.value })}
                                    placeholder="Mô tả"
                                    size="large"
                                    style={{ borderRadius: 8 }}
                                />
                            </Form.Item>
                            <Form.Item style={{ marginBottom: 12 }}>
                                <Checkbox
                                    checked={q.required}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(idx, { required: e.target.checked })}
                                >Yêu cầu trả lời</Checkbox>
                            </Form.Item>
                            {(q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') && (
                                <Form.Item label="Các lựa chọn" style={{ marginBottom: 12 }}>
                                    {q.options && q.options.map((opt: string, optIdx: number) => (
                                        <Space key={optIdx} style={{ display: 'flex', marginBottom: 8 }}>
                                            <Input
                                                value={opt}
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
                        </Form>
                    </Panel>
                ))}
            </Collapse>
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
        </div>
    );
}; 