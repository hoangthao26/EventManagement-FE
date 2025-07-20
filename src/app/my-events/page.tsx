"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
import Loading from "@/shared/ui/Loading";
import { Card, Typography, Row, Col, Input, Select, Empty, Tag, Space, Button, notification, Modal, Descriptions, Form, Radio, Rate, Checkbox, Pagination } from "antd";
import { useRouter } from "next/navigation";
import { SearchOutlined, CalendarOutlined, EnvironmentOutlined, TeamOutlined, ClearOutlined, FileTextOutlined } from "@ant-design/icons";
import { format, parseISO } from "date-fns";
import HomeLayout from "@/widgets/layouts/ui/HomeLayout";
import { DatePicker } from 'antd';
import moment from "moment";
import axiosInstance from '@/shared/lib/axios';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Search } = Input;
const { TextArea } = Input;

interface RegisteredEvent {
    id: number;
    name: string;
    description: string;
    locationAddress: string;
    locationAddress2: string;
    startTime: string;
    endTime: string;
    mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
    posterUrl: string;
    registrationStatus: string;
    typeName: string;
    departmentName: string;
    status: string;
}

interface SurveyOption {
    id: number;
    text: string;
    orderNum: number;
}

interface SurveyQuestion {
    id: number;
    question: string;
    orderNum: number;
    type: 'TEXT' | 'RADIO' | 'CHECKBOX' | 'DROPDOWN' | 'RATING';
    isRequired: boolean;
    options: SurveyOption[];
}

interface Survey {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    questions: SurveyQuestion[];
}

type EventMode = 'ONLINE' | 'OFFLINE' | 'HYBRID';

export default function MyEventsPage() {
    const { session, status } = useAuth();
    const router = useRouter();
    const [allEvents, setAllEvents] = useState<RegisteredEvent[]>([]);
    const [filteredEvents, setFiltereredEvents] = useState<RegisteredEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
    const [mode, setMode] = useState<EventMode | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [paginatedEvents, setPaginatedEvents] = useState<RegisteredEvent[]>([]);

    // Cancel registration states
    const [cancelling, setCancelling] = useState<number | null>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

    // Survey states
    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
    const [surveyLoading, setSurveyLoading] = useState(false);
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [form] = Form.useForm();
    const [noSurveyAvailable, setNoSurveyAvailable] = useState(false);

    // Track submitted surveys to disable survey button (persisted in localStorage)
    const [submittedSurveyEventIds, setSubmittedSurveyEventIds] = useState<number[]>([]);

    // Load submitted survey event IDs from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('submittedSurveyEventIds');
        if (stored) {
            setSubmittedSurveyEventIds(JSON.parse(stored));
        }
    }, []);

    useEffect(() => {
        let isSubscribed = true;

        const fetchRegisteredEvents = async () => {
            try {
                const response = await axiosInstance.get<any[]>('/events/registered');
                const mappedData: RegisteredEvent[] = response.data.map((item: any) => ({
                    ...item.eventInfo,
                    registrationStatus: item.registrationStatus,
                    status: item.eventInfo.status,
                }));
                if (isSubscribed) {
                    setAllEvents(mappedData);
                    setFiltereredEvents(mappedData);
                }
            } catch (error) {
                if (isSubscribed) {
                    notification.error({
                        message: 'Error',
                        description: 'Failed to fetch registered events'
                    });
                }
            } finally {
                if (isSubscribed) {
                    setLoading(false);
                }
            }
        };

        if (status === "authenticated") {
            fetchRegisteredEvents();
        }

        return () => {
            isSubscribed = false;
        };
    }, [status]);

    // Client-side filtering
    useEffect(() => {
        let result = [...allEvents];

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(event =>
                event.name.toLowerCase().includes(term) ||
                event.description.toLowerCase().includes(term)
            );
        }

        // Filter by mode
        if (mode !== null) {
            result = result.filter(event => event.mode === mode);
        }

        // Filter by date range
        if (dateRange && dateRange[0] && dateRange[1]) {
            const [start, end] = dateRange;
            result = result.filter(event => {
                const eventDate = moment(event.startTime);
                return eventDate.isBetween(start, end, 'day', '[]');
            });
        }

        setFiltereredEvents(result);
    }, [allEvents, searchTerm, mode, dateRange]);

    // Pagination effect 
    useEffect(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        setPaginatedEvents(filteredEvents.slice(startIndex, endIndex));
    }, [filteredEvents, currentPage, pageSize]);

    // Divide paginatedEvents into active and completed
    const activeEvents = paginatedEvents.filter(event => event.status !== "COMPLETED");
    const completedEvents = paginatedEvents.filter(event => event.status === "COMPLETED");

    const getEventTypeTag = (type: string) => {
        const typeColors: Record<string, string> = {
            'Seminar': 'blue',
            'Workshop': 'purple',
            'Orientation': 'green',
            'Other': 'default'
        };

        return <Tag color={typeColors[type] || 'default'}>{type}</Tag>;
    };

    const getModeTag = (mode: 'ONLINE' | 'OFFLINE' | 'HYBRID') => {
        const modeColors = {
            'ONLINE': 'cyan',
            'OFFLINE': 'orange',
            'HYBRID': 'purple'
        };
        const modeLabels = {
            'ONLINE': 'Trực tuyến',
            'OFFLINE': 'Trực tiếp',
            'HYBRID': 'Kết hợp'
        };
        return <Tag color={modeColors[mode]}>{modeLabels[mode]}</Tag>;
    };

    const resetFilters = () => {
        setSearchTerm('');
        setDateRange(null);
        setMode(null);
        setCurrentPage(1);
    };

    const showCancelModal = (eventId: number) => {
        setSelectedEventId(eventId);
        setIsCancelModalOpen(true);
    };

    const handleCancelRegistration = async () => {
        if (!selectedEventId) return;

        try {
            setCancelling(selectedEventId);
            await axiosInstance.delete(`/registrations/${selectedEventId}`);

            notification.success({
                message: 'Success',
                description: 'Successfully cancelled registration'
            });

            setAllEvents(prev => prev.map(event => 
                event.id === selectedEventId 
                    ? { ...event, registrationStatus: 'CANCELED' }
                    : event
            ));

            setIsCancelModalOpen(false);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Failed to cancel registration'
            });
        } finally {
            setCancelling(null);
            setSelectedEventId(null);
        }
    };

    // Survey submit: always show success, disable button after submit, no update/review
    const handleSurveySubmit = async () => {
        if (!survey || !selectedEventId) return;

        const formValues = form.getFieldsValue();
        const answers = survey.questions.map(question => {
            const fieldName = `question_${question.id}`;
            const value = formValues[fieldName];

            let selectedOptions: { optionId: number }[] = [];
            let answerText = '';

            switch (question.type) {
                case 'TEXT':
                    answerText = value || '';
                    break;
                case 'RADIO':
                case 'DROPDOWN':
                    if (value) {
                        selectedOptions = [{ optionId: value }];
                    }
                    break;
                case 'CHECKBOX':
                    if (Array.isArray(value) && value.length > 0) {
                        selectedOptions = value.map(optionId => ({ optionId }));
                    }
                    break;
                case 'RATING':
                    answerText = value ? value.toString() : '';
                    break;
                default:
                    answerText = value || '';
            }

            return {
                questionId: question.id,
                selectedOptions,
                answerText
            };
        });

        const registrationId = selectedEventId;
        const requestBody = {
            surveyId: survey.id,
            registrationId: registrationId,
            answers: answers
        };

        try {
            await axiosInstance.post('/surveys/submit', requestBody);
        } catch (error) {
            // Ignore error
        }
        notification.success({
            message: 'Success',
            description: 'Survey submitted successfully'
        });

        setSubmittedSurveyEventIds(prev => {
            const updated = [...prev, selectedEventId];
            localStorage.setItem('submittedSurveyEventIds', JSON.stringify(updated));
            return updated;
        });

        setIsSurveyModalOpen(false);
        form.resetFields();
        setSurvey(null);
        setNoSurveyAvailable(false);
        setSelectedEventId(null);
    };

    // Only fetch survey, no review/update logic
    const showSurveyModal = async (eventId: number) => {
        setSelectedEventId(eventId);
        setSurveyLoading(true);
        setIsSurveyModalOpen(true);
        setNoSurveyAvailable(false);

        try {
            const surveyResponse = await axiosInstance.get<Survey>(`/surveys/events/${eventId}/survey/opened`);
            if (!surveyResponse.data || !surveyResponse.data.id) {
                setNoSurveyAvailable(true);
                setSurvey(null);
                return;
            }
            setSurvey(surveyResponse.data);
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                setNoSurveyAvailable(true);
            } else {
                notification.error({
                    message: 'Error',
                    description: 'Failed to fetch survey'
                });
            }
            setSurvey(null);
            setIsSurveyModalOpen(true);
        } finally {
            setSurveyLoading(false);
        }
    };

    const renderSurveyQuestion = (question: SurveyQuestion) => {
        switch (question.type) {
            case 'TEXT':
                return (
                    <Form.Item
                        key={question.id}
                        name={`question_${question.id}`}
                        label={question.question}
                        rules={[{ required: question.isRequired, message: 'This field is required' }]}
                    >
                        <TextArea rows={3} placeholder="Enter your answer..." />
                    </Form.Item>
                );
            
            case 'RADIO':
                return (
                    <Form.Item
                        key={question.id}
                        name={`question_${question.id}`}
                        label={question.question}
                        rules={[{ required: question.isRequired, message: 'This field is required' }]}
                    >
                        <Radio.Group>
                            <Space direction="vertical">
                                {question.options.map(option => (
                                    <Radio key={option.id} value={option.id}>
                                        {option.text}
                                    </Radio>
                                ))}
                            </Space>
                        </Radio.Group>
                    </Form.Item>
                );
            
            case 'CHECKBOX':
                return (
                    <Form.Item
                        key={question.id}
                        name={`question_${question.id}`}
                        label={question.question}
                        rules={[{ required: question.isRequired, message: 'This field is required' }]}
                    >
                        <Checkbox.Group>
                            <Space direction="vertical">
                                {question.options.map(option => (
                                    <Checkbox key={option.id} value={option.id}>
                                        {option.text}
                                    </Checkbox>
                                ))}
                            </Space>
                        </Checkbox.Group>
                    </Form.Item>
                );
            
            case 'DROPDOWN':
                return (
                    <Form.Item
                        key={question.id}
                        name={`question_${question.id}`}
                        label={question.question}
                        rules={[{ required: question.isRequired, message: 'This field is required' }]}
                    >
                        <Select placeholder="Please select an option">
                            {question.options.map(option => (
                                <Select.Option key={option.id} value={option.id}>
                                    {option.text}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                );
            
            case 'RATING':
                return (
                    <Form.Item
                        key={question.id}
                        name={`question_${question.id}`}
                        label={question.question}
                        rules={[{ required: question.isRequired, message: 'This field is required' }]}
                    >
                        <Rate allowHalf />
                    </Form.Item>
                );
            
            default:
                return null;
        }
    };

    const getActionButton = (event: RegisteredEvent) => {
        if (event.registrationStatus === "ATTENDED") {
            const isSurveySubmitted = submittedSurveyEventIds.includes(event.id);
            return (
                <Button
                    type="default"
                    block
                    icon={<FileTextOutlined />}
                    onClick={() => showSurveyModal(event.id)}
                    disabled={isSurveySubmitted}
                >
                    Làm khảo sát
                </Button>
            );
        } else if (event.registrationStatus === "CANCELED") {
            return (
                <Button
                    type="default"
                    danger
                    block
                    disabled
                >
                    Đã hủy
                </Button>
            );
        } else {
            return (
                <Button
                    type="default"
                    danger
                    block
                    loading={cancelling === event.id}
                    onClick={() => showCancelModal(event.id)}
                    disabled={event.status === "COMPLETED"}
                >
                    Hủy đăng ký
                </Button>
            );
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <HomeLayout>
            <div style={{ padding: "24px" }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: '32px',
                    background: '#ff8533',
                    padding: '24px',
                    borderRadius: '8px',
                    color: 'white'
                }}>
                    <Space align="center" size="middle">
                        <CalendarOutlined style={{ fontSize: '32px' }} />
                        <Title level={2} style={{ margin: 0, color: 'white' }}>
                            Sự kiện đã đăng ký
                        </Title>
                    </Space>
                </div>

                <Card style={{ marginBottom: 24 }}>
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <Row gutter={[16, 16]} justify="center">
                            <Col span={16}>
                                <Search
                                    placeholder="Tìm kiếm sự kiện..."
                                    allowClear
                                    enterButton
                                    size="large"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Col>
                        </Row>
                        <Row gutter={[16, 16]} justify="center">
                            <Col>
                                <Select
                                    style={{ width: 200 }}
                                    placeholder="Hình thức"
                                    allowClear
                                    value={mode}
                                    onChange={setMode}
                                    options={[
                                        { value: null, label: 'Tất cả' },
                                        { value: 'ONLINE', label: 'Trực tuyến' },
                                        { value: 'OFFLINE', label: 'Trực tiếp' },
                                        { value: 'HYBRID', label: 'Kết hợp' }
                                    ]}
                                />
                            </Col>
                            <Col>
                                <RangePicker
                                    value={dateRange}
                                    onChange={(dates) => setDateRange(dates)}
                                    disabledDate={(current) => {
                                        return current && current < moment().startOf('day');
                                    }}
                                />
                            </Col>
                            <Col>
                                <Button 
                                    icon={<ClearOutlined />}
                                    onClick={resetFilters}
                                >
                                    Xóa bộ lọc
                                </Button>
                            </Col>
                        </Row>
                    </Space>
                </Card>

                {filteredEvents.length > 0 ? (
                    <>
                        {/* Active Events Section */}
                        {activeEvents.length > 0 && (
                            <>
                                <Title level={3} style={{ margin: '24px 0 12px' }}>Sự kiện đang tham gia</Title>
                                <Row gutter={[16, 16]}>
                                    {activeEvents.map((event) => (
                                        <Col xs={24} sm={12} md={8} key={event.id}>
                                            <Card
                                                hoverable
                                                cover={
                                                    <img
                                                        alt={event.name}
                                                        src={event.posterUrl}
                                                        style={{ height: 200, objectFit: 'cover' }}
                                                    />
                                                }
                                            >
                                                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                                    <div style={{ minHeight: 32 }}>
                                                        <Space size={[0, 8]} wrap>
                                                            {getEventTypeTag(event.typeName)}
                                                            {getModeTag(event.mode)}
                                                            <Tag color="green">{event.registrationStatus}</Tag>
                                                        </Space>
                                                    </div>
                                                    <Typography.Title
                                                        level={4}
                                                        ellipsis={{ rows: 1 }}
                                                        style={{ marginTop: 0, marginBottom: 0 }}
                                                    >
                                                        {event.name}
                                                    </Typography.Title>
                                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                        <Text type="secondary" ellipsis>
                                                            <CalendarOutlined /> {format(parseISO(event.startTime), "dd/MM/yyyy HH:mm")}
                                                        </Text>
                                                        <Text type="secondary" ellipsis>
                                                            <EnvironmentOutlined /> {event.locationAddress}
                                                        </Text>
                                                    </Space>
                                                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                                        <Button
                                                            type="primary"
                                                            block
                                                            onClick={() => router.push(`/events/${event.id}`)}
                                                        >
                                                            Xem chi tiết
                                                        </Button>
                                                        {getActionButton(event)}
                                                    </Space>
                                                </Space>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </>
                        )}

                        {/* Completed Events Section */}
                        {completedEvents.length > 0 && (
                            <>
                                <Title level={3} style={{ margin: '32px 0 12px' }}>Sự kiện đã hoàn thành</Title>
                                <Row gutter={[16, 16]}>
                                    {completedEvents.map((event) => (
                                        <Col xs={24} sm={12} md={8} key={event.id}>
                                            <Card
                                                hoverable
                                                cover={
                                                    <img
                                                        alt={event.name}
                                                        src={event.posterUrl}
                                                        style={{ height: 200, objectFit: 'cover' }}
                                                    />
                                                }
                                            >
                                                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                                    <div style={{ minHeight: 32 }}>
                                                        <Space size={[0, 8]} wrap>
                                                            {getEventTypeTag(event.typeName)}
                                                            {getModeTag(event.mode)}
                                                            <Tag color="green">{event.registrationStatus}</Tag>
                                                        </Space>
                                                    </div>
                                                    <Typography.Title
                                                        level={4}
                                                        ellipsis={{ rows: 1 }}
                                                        style={{ marginTop: 0, marginBottom: 0 }}
                                                    >
                                                        {event.name}
                                                    </Typography.Title>
                                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                        <Text type="secondary" ellipsis>
                                                            <CalendarOutlined /> {format(parseISO(event.startTime), "dd/MM/yyyy HH:mm")}
                                                        </Text>
                                                        <Text type="secondary" ellipsis>
                                                            <EnvironmentOutlined /> {event.locationAddress}
                                                        </Text>
                                                    </Space>
                                                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                                        <Button
                                                            type="primary"
                                                            block
                                                            onClick={() => router.push(`/events/${event.id}`)}
                                                        >
                                                            Xem chi tiết
                                                        </Button>
                                                        {getActionButton(event)}
                                                    </Space>
                                                </Space>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </>
                        )}

                        {/* Pagination */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
                            <Pagination
                                current={currentPage}
                                total={filteredEvents.length}
                                pageSize={pageSize}
                                showSizeChanger
                                showQuickJumper
                                showTotal={(total, range) => 
                                    `${range[0]}-${range[1]} of ${total} events`
                                }
                                pageSizeOptions={['6', '12', '24', '48']}
                                onChange={(page, size) => {
                                    setCurrentPage(page);
                                    if (size !== pageSize) {
                                        setPageSize(size);
                                        setCurrentPage(1);
                                    }
                                }}
                            />
                        </div>
                    </>
                ) : (
                    <Empty
                        description="Bạn chưa đăng ký sự kiện nào"
                        style={{ margin: '48px 0' }}
                    />
                )}

                {/* Cancel Registration Modal */}
                <Modal
                    title="Xác nhận hủy đăng ký"
                    open={isCancelModalOpen}
                    onOk={handleCancelRegistration}
                    onCancel={() => {
                        setIsCancelModalOpen(false);
                        setSelectedEventId(null);
                    }}
                    confirmLoading={cancelling !== null}
                    okText="Xác nhận"
                    cancelText="Hủy"
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {selectedEventId && filteredEvents.find(e => e.id === selectedEventId) && (
                            <>
                                <Title level={4}>
                                    {filteredEvents.find(e => e.id === selectedEventId)?.name}
                                </Title>
                                <Descriptions column={1}>
                                    <Descriptions.Item label="Thời gian">
                                        {format(
                                            parseISO(filteredEvents.find(e => e.id === selectedEventId)?.startTime || ''),
                                            "dd/MM/yyyy HH:mm"
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Địa điểm">
                                        {filteredEvents.find(e => e.id === selectedEventId)?.locationAddress}
                                    </Descriptions.Item>
                                </Descriptions>
                                <Text>
                                    Bạn có chắc chắn muốn hủy đăng ký sự kiện này không?
                                </Text>
                            </>
                        )}
                    </Space>
                </Modal>

                {/* Survey Modal */}
                <Modal
                    title="Khảo sát sự kiện"
                    open={isSurveyModalOpen}
                    onCancel={() => {
                        setIsSurveyModalOpen(false);
                        setSelectedEventId(null);
                        setSurvey(null);
                        setNoSurveyAvailable(false);
                        form.resetFields();
                    }}
                    footer={[
                        <Button key="cancel" onClick={() => {
                            setIsSurveyModalOpen(false);
                            setSelectedEventId(null);
                            setSurvey(null);
                            setNoSurveyAvailable(false);
                            form.resetFields();
                        }}>
                            Hủy
                        </Button>,
                        <Button key="submit" type="primary" onClick={() => {
                            form.validateFields()
                                .then(() => {
                                    handleSurveySubmit();
                                })
                                .catch(() => {
                                    notification.warning({
                                        message: 'Validation Error',
                                        description: 'Please fill in all required fields'
                                    });
                                });
                        }} disabled={noSurveyAvailable}>
                            Gửi khảo sát
                        </Button>
                    ]}
                    width={800}
                >
                    {surveyLoading ? (
                        <Loading />
                    ) : noSurveyAvailable ? (
                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                            <Title level={4}>Không có khảo sát nào cho sự kiện này</Title>
                            <Text type="secondary">Hiện tại không có khảo sát nào được mở cho sự kiện này.</Text>
                        </div>
                    ) : survey ? (
                        <div>
                            <Title level={4}>{survey.title}</Title>
                            <Text type="secondary">{survey.description}</Text>
                            <Form
                                form={form}
                                layout="vertical"
                                style={{ marginTop: 24 }}
                            >
                                {survey.questions
                                    .sort((a, b) => a.orderNum - b.orderNum)
                                    .map(question => renderSurveyQuestion(question))}
                            </Form>
                        </div>
                    ) : null}
                </Modal>
            </div>
        </HomeLayout>
    );
}