'use client';

import { useState } from 'react';
import { Form, Input, DatePicker, Select, InputNumber, Button, Card, Row, Col, Radio, Typography } from 'antd';
import { ImageUpload } from './ImageUpload';
import { EVENT_TYPES } from '../lib/constants';
import { Editor } from '@tinymce/tinymce-react';
import type { CreateEventData } from '../model/types';

const { Title } = Typography;

interface CreateEventFormProps {
    onSubmit: (data: CreateEventData) => void;
    loading?: boolean;
}

export function CreateEventForm({ onSubmit, loading }: CreateEventFormProps) {
    const [form] = Form.useForm();
    const [isOnline, setIsOnline] = useState(false);

    const handleSubmit = (values: any) => {
        onSubmit({
            ...values,
            startTime: values.timeRange[0].toDate(),
            endTime: values.timeRange[1].toDate(),
        });
    };

    return (
        <Card title={<Title level={4}>Create New Event</Title>} style={{ width: '100%', margin: '0 auto' }}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    capacity: {
                        student: 0,
                        lecturer: 0,
                    },
                    isOnline: false,
                }}
            >
                <div style={{ fontWeight: 600, color: '#222', marginBottom: 8 }}>
                    Upload images
                </div>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={24} md={6}>
                        <Form.Item
                            name="poster"
                            rules={[{ required: true, message: 'Please upload event logo' }]}
                            style={{ marginBottom: 0 }}
                        >
                            <ImageUpload type="POSTER" height={350}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <p >Add event logo</p>
                                    <p style={{ fontWeight: 'bold' }}>(720x958)</p>
                                </div>
                            </ImageUpload>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={18}>
                        <Form.Item
                            name="banner"
                            rules={[{ required: true, message: 'Please upload event banner' }]}
                            style={{ marginBottom: 0 }}
                        >
                            <ImageUpload type="BANNER" height={350}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <p >Add event banner</p>
                                    <p style={{ fontWeight: 'bold' }}>(1280x720)</p>
                                </div>
                            </ImageUpload>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label={<b>Event name</b>}
                    name="title"
                    rules={[{ required: true, message: 'Please enter event name' }]}
                >
                    <Input maxLength={100} placeholder="Event name" />
                </Form.Item>

                <Form.Item label={<b>Event type</b>} name="isOnline" style={{ marginBottom: 0 }}>
                    <Radio.Group
                        onChange={(e: any) => setIsOnline(e.target.value)}
                        optionType="button"
                        buttonStyle="solid"
                    >
                        <Radio value={false}>Offline event</Radio>
                        <Radio value={true}>Online event</Radio>
                    </Radio.Group>
                </Form.Item>

                {!isOnline && (
                    <Form.Item
                        label={<b>Address</b>}
                        name="address"
                        rules={[{ required: true, message: 'Please enter event address' }]}
                    >
                        <Input maxLength={80} placeholder="Event address" />
                    </Form.Item>
                )}

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label={<b>Event time</b>}
                            name="timeRange"
                            rules={[{ required: true, message: 'Please select event time' }]}
                        >
                            <DatePicker.RangePicker showTime style={{ width: '100%' }} placeholder={["Start date", "End date"]} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label={<b>Registration time</b>}
                            name="registrationTimeRange"
                            rules={[{ required: true, message: 'Please select registration time' }]}
                        >
                            <DatePicker.RangePicker showTime style={{ width: '100%' }} placeholder={["Start date", "End date"]} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label={<b>Event category</b>}
                    name="type"
                    rules={[{ required: true, message: 'Please select event category' }]}
                >
                    <Select options={EVENT_TYPES} placeholder="Select event category" />
                </Form.Item>

                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Capacity</div>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Student capacity"
                                name={['capacity', 'student']}
                                rules={[{ required: true, message: 'Please enter student capacity' }]}
                            >
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="Student capacity" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Lecturer capacity"
                                name={['capacity', 'lecturer']}
                                rules={[{ required: true, message: 'Please enter lecturer capacity' }]}
                            >
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="Lecturer capacity" />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                <Form.Item
                    label={<b>Description</b>}
                    name="description"
                    rules={[{ required: true, message: 'Please enter event description' }]}
                >
                    <Editor
                        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                        init={{
                            height: 300,
                            menubar: false,
                            branding: false,
                            plugins: [
                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                            ],
                            toolbar:
                                'undo redo | blocks fontsize | bold italic underline forecolor backcolor | ' +
                                'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
                                'removeformat | image media code',
                            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                        }}
                    />
                </Form.Item>

                <Form.Item
                    label={<b>Department info</b>}
                    name="departmentInfo"
                    rules={[{ required: true, message: 'Please enter department info' }]}
                >
                    <Input.TextArea rows={4} placeholder="Department info" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Create Event
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
} 