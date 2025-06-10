'use client';

import { useState, useEffect, useRef } from 'react';
import { Form, Input, DatePicker, Select, InputNumber, Button, Card, Row, Col, Radio, Typography, Upload, Image } from 'antd';
import { ImageUpload } from './ImageUpload';
import { EVENT_TYPES } from '../lib/constants';
import { Editor } from '@tinymce/tinymce-react';
import { InboxOutlined } from '@ant-design/icons';
import { fetchEventTypes, fetchActiveTags } from '../api';
import styles from '../styles/ImageUpload.module.css';
import { useRouter } from 'next/navigation';
import { useAntdMessage } from '@/shared/lib/hooks/useAntdMessage';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
const { Title } = Typography;

interface CreateEventFormProps {
    onSubmit: (data: any) => void;
    loading?: boolean;
    departments: { departmentName: string; departmentCode: string }[];
    initialValues?: any;
    isUpdate?: boolean;
    disabled?: boolean;
    statusMessage?: string;
}

type ImageType = 'banner' | 'poster';

async function uploadToCloudinary(file: File, type: ImageType, eventName: string): Promise<string> {
    if (!file) throw new Error('No file provided');
    if (!eventName) throw new Error('Event name is required');

    // Format tên sự kiện: loại_bỏ_dấu_cách_và_ký_tự_đặc_biệt
    const formattedEventName = eventName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');

    // Thêm timestamp
    const timestamp = new Date().getTime();
    const publicId = `${type}/${formattedEventName}_${timestamp}`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', type === 'banner' ? 'upload_banner' : 'upload_poster');
    formData.append('public_id', publicId);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );
        const data = await response.json();
        if (!data.secure_url) throw new Error('Upload failed');
        return data.secure_url;
    } catch (error) {
        console.error(`Failed to upload ${type}:`, error);
        throw new Error(`Failed to upload ${type}`);
    }
}

// Hàm xóa ảnh bằng delete_token
const deleteFailedUploads = async (deleteTokens: string[]) => {
    for (const token of deleteTokens) {
        await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/delete_by_token`,
            {
                method: 'POST',
                body: (() => {
                    const fd = new FormData();
                    fd.append('token', token);
                    return fd;
                })(),
            }
        );
    }
};

const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

export function CreateEventForm({ onSubmit, loading, departments, initialValues, isUpdate, disabled, statusMessage }: CreateEventFormProps) {
    const [form] = Form.useForm();
    const editorRef = useRef<any>(null);
    const router = useRouter();
    const { showSuccess, showError } = useAntdMessage();
    const [eventMode, setEventMode] = useState<'OFFLINE' | 'ONLINE' | 'HYBRID'>(initialValues?.mode || 'OFFLINE');
    const [submitting, setSubmitting] = useState(false);
    const [eventTypes, setEventTypes] = useState([]);
    const [tags, setTags] = useState([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [audience, setAudience] = useState(initialValues?.audience || 'STUDENT');
    const [imageList, setImageList] = useState<any[]>(initialValues?.imageUrls?.map((url: string, index: number) => ({
        uid: `${url}-${index}`,
        name: url.split('/').pop(),
        status: 'done',
        url: url
    })) || []);
    const [editorValue, setEditorValue] = useState(String(initialValues?.description ?? ''));
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [checkinTimeTouched, setCheckinTimeTouched] = useState(false);

    useEffect(() => {
        fetchEventTypes().then(setEventTypes);
        fetchActiveTags().then(setTags);
    }, []);

    // Set initial values when they change
    useEffect(() => {
        if (initialValues) {
            // Convert checkinStart/checkinEnd to dayjs for RangePicker
            if (initialValues.checkinStart && initialValues.checkinEnd) {
                form.setFieldsValue({
                    ...initialValues,
                    checkinTimeRange: [
                        dayjs(initialValues.checkinStart),
                        dayjs(initialValues.checkinEnd)
                    ]
                });
            } else {
                form.setFieldsValue(initialValues);
            }
            console.log('initialValues.checkinTimeRange:', initialValues?.checkinTimeRange);
            if (editorRef.current && !editorRef.current.getContent()) {
                editorRef.current.setContent(initialValues.description);
            }
        }
    }, [initialValues, form]);

    useEffect(() => {
        if (initialValues?.description !== undefined) {
            setEditorValue(String(initialValues.description ?? ''));
        }
    }, [initialValues?.description]);

    const handleImageChange = (files: File[]) => {
        setImageFiles(files);
    };

    const handleImageWallChange: UploadProps['onChange'] = ({ fileList }) => {
        setImageList(fileList);
    };

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as File);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleSubmit = async (values: any) => {
        let uploadedDeleteTokens: string[] = [];
        try {
            setSubmitting(true);
            const eventName = values.name;

            // Lấy nội dung từ TinyMCE Editor
            const description = editorValue;

            // Upload poster
            let posterUrl = values.poster;
            if (posterUrl instanceof File) {
                posterUrl = await uploadToCloudinary(posterUrl, 'poster', eventName);
            }

            // Upload banner
            let bannerUrl = values.banner;
            if (bannerUrl instanceof File) {
                bannerUrl = await uploadToCloudinary(bannerUrl, 'banner', eventName);
            }

            // Upload imageUrls (gallery)
            let imageUrls: string[] = [];
            for (let i = 0; i < imageList.length; i++) {
                const file = imageList[i].originFileObj;
                if (file) {
                    const timestamp = new Date().getTime();
                    const publicId = `gallery/${eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}_${i + 1}`;
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('upload_preset', 'upload_gallery');
                    formData.append('public_id', publicId);
                    const response = await fetch(
                        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                        {
                            method: 'POST',
                            body: formData,
                        }
                    );
                    const data = await response.json();
                    if (data.secure_url) imageUrls.push(data.secure_url);
                    if (data.delete_token) uploadedDeleteTokens.push(data.delete_token);
                } else if (imageList[i].url) {
                    // Ảnh cũ, giữ lại url
                    imageUrls.push(imageList[i].url);
                }
            }

            // Build address
            const location = {
                address: values.address,
                ward: values.ward,
                district: values.district,
                city: values.city,
            };

            // Build roleCapacities
            const roleCapacities = [];
            if (values.studentCapacity) {
                roleCapacities.push({ roleName: 'STUDENT', maxCapacity: values.studentCapacity });
            }
            if (values.lecturerCapacity) {
                roleCapacities.push({ roleName: 'LECTURER', maxCapacity: values.lecturerCapacity });
            }

            // Build platform
            let platform = undefined;
            if (eventMode !== 'OFFLINE') {
                platform = {
                    name: values.platformName,
                    url: values.platformUrl,
                };
            }

            // Build payload 
            const [checkinStart, checkinEnd] = values.checkinTimeRange || [];
            const payload = {
                name: values.name,
                description,
                typeId: values.typeId,
                audience: values.audience,
                posterUrl,
                bannerUrl,
                mode: eventMode,
                location: eventMode !== 'ONLINE' ? location : undefined,
                maxCapacity: (values.studentCapacity || 0) + (values.lecturerCapacity || 0),
                roleCapacities,
                platform: eventMode !== 'OFFLINE' ? { name: values.platformName, url: values.platformUrl } : undefined,
                tags: values.tags,
                imageUrls,
                startTime: values.timeRange[0].toISOString(),
                endTime: values.timeRange[1].toISOString(),
                registrationStart: values.registrationTimeRange[0].toISOString(),
                registrationEnd: values.registrationTimeRange[1].toISOString(),
                checkinStart,
                checkinEnd,
            };

            // Gọi API tạo event
            await onSubmit({ ...payload, departmentCode: values.departmentCode });
            // Chuyển hướng sang trang organizer/my-events sau khi tạo thành công
            router.push('/organizer/my-events');
        } catch (err) {
            console.error('Error creating event:', err);
            showError('Failed to upload images or create event');
            if (uploadedDeleteTokens.length > 0) {
                await deleteFailedUploads(uploadedDeleteTokens);
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
                ...initialValues,
                mode: eventMode,
                audience: initialValues?.audience || 'STUDENT',
            }}
            disabled={disabled}
            onValuesChange={(changed: any, all: any) => {
                if (changed.timeRange && !checkinTimeTouched) {
                    form.setFieldsValue({ checkinTimeRange: changed.timeRange });
                }
                if (changed.checkinTimeRange) {
                    setCheckinTimeTouched(true);
                }
            }}
        >
            <div style={{ fontWeight: 'bold', color: '#222', marginBottom: 8 }}>
                Upload images
            </div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} md={6}>
                    <Form.Item
                        name="poster"
                        rules={[{ required: true, message: 'Please upload event logo' }]}
                        style={{ marginBottom: 0 }}
                    >
                        <ImageUpload type="POSTER" height={400} />
                    </Form.Item>
                </Col>
                <Col xs={24} md={18}>
                    <Form.Item
                        name="banner"
                        rules={[{ required: true, message: 'Please upload event banner' }]}
                        style={{ marginBottom: 0 }}
                    >
                        <ImageUpload type="BANNER" height={400} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item
                        label={<b>Event name</b>}
                        name="name"
                        rules={[{ required: true, message: 'Please enter event name' }]}
                    >
                        <Input maxLength={100} placeholder="Event name" />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    {!isUpdate && (
                        <Form.Item
                            label={<b>Department</b>}
                            name="departmentCode"
                            rules={[{ required: true, message: 'Please select department' }]}
                        >
                            <Select
                                options={departments.map(dep => ({ label: dep.departmentName, value: dep.departmentCode }))}
                                placeholder="Select department"
                            />
                        </Form.Item>
                    )}
                </Col>
            </Row>
            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item
                        label={<b>Event type</b>}
                        name="typeId"
                        rules={[{ required: true, message: 'Please select event type' }]}
                    >
                        <Select
                            options={eventTypes.map((t: any) => ({ label: t.name, value: t.id }))}
                            placeholder="Select event type"
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item
                        label={<b>Tags</b>}
                        name="tags"
                        rules={[{ required: true, message: 'Please select tags' }]}
                    >
                        <Select
                            mode="multiple"
                            className={styles.customTagSelect}
                            options={tags.map((t: any) => ({ label: t.name, value: t.id }))}
                            placeholder="Select tags"
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16} align="middle">
                <Col xs={24} md={8}>
                    <Form.Item
                        label={<b>Audience</b>}
                        name="audience"
                        rules={[{ required: true, message: 'Please select audience' }]}
                    >
                        <Select
                            options={[
                                { label: 'Student', value: 'STUDENT' },
                                { label: 'Lecturer', value: 'LECTURER' },
                                { label: 'Both', value: 'BOTH' }
                            ]}
                            onChange={setAudience}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={16}>

                    <Row gutter={16}>
                        {(audience === 'STUDENT' || audience === 'BOTH') && (
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Student capacity"
                                    name="studentCapacity"
                                    rules={[{ required: audience === 'STUDENT' || audience === 'BOTH', message: 'Please enter student capacity' }]}
                                >
                                    <InputNumber min={0} style={{ width: '100%' }} placeholder="Student capacity" />
                                </Form.Item>
                            </Col>
                        )}
                        {(audience === 'LECTURER' || audience === 'BOTH') && (
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Lecturer capacity"
                                    name="lecturerCapacity"
                                    rules={[{ required: audience === 'LECTURER' || audience === 'BOTH', message: 'Please enter lecturer capacity' }]}
                                >
                                    <InputNumber min={0} style={{ width: '100%' }} placeholder="Lecturer capacity" />
                                </Form.Item>
                            </Col>
                        )}
                    </Row>
                </Col>
            </Row>



            <Form.Item label={<b>Mode</b>} name="mode">
                <Radio.Group onChange={(e: { target: { value: 'OFFLINE' | 'ONLINE' | 'HYBRID' } }) => setEventMode(e.target.value)}>
                    <Radio value="OFFLINE">Offline</Radio>
                    <Radio value="ONLINE">Online</Radio>
                    <Radio value="HYBRID">Hybrid</Radio>
                </Radio.Group>
            </Form.Item>

            {(eventMode === 'OFFLINE' || eventMode === 'HYBRID') && (
                <Row gutter={16}>
                    <Col xs={24} md={6}>
                        <Form.Item
                            label="Address"
                            name="address"
                            rules={[{ required: true, message: 'Please enter address' }]}
                        >
                            <Input placeholder="Address" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                        <Form.Item
                            label="Ward"
                            name="ward"
                            rules={[{ required: true, message: 'Please enter ward' }]}
                        >
                            <Input placeholder="Ward" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                        <Form.Item
                            label="District"
                            name="district"
                            rules={[{ required: true, message: 'Please enter district' }]}
                        >
                            <Input placeholder="District" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                        <Form.Item
                            label="City"
                            name="city"
                            rules={[{ required: true, message: 'Please enter city' }]}
                        >
                            <Input placeholder="City" />
                        </Form.Item>
                    </Col>
                </Row>
            )}
            {(eventMode === 'ONLINE' || eventMode === 'HYBRID') && (
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Platform name"
                            name="platformName"
                            rules={[{ required: true, message: 'Please enter platform name' }]}
                        >
                            <Input placeholder="Platform name" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Platform URL"
                            name="platformUrl"
                            rules={[{ required: true, message: 'Please enter platform URL' }]}
                        >
                            <Input placeholder="Platform URL" />
                        </Form.Item>
                    </Col>
                </Row>
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
                label="Check-in Time"
                name="checkinTimeRange"
                rules={[{ required: true, message: 'Please select check-in time range' }]}
            >
                <DatePicker.RangePicker
                    showTime
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD HH:mm"
                    disabled={disabled}
                />
            </Form.Item>

            <Form.Item label={<b>Gallery images</b>} name="imageUrls">
                <Upload
                    listType="picture-card"
                    fileList={imageList}
                    onChange={handleImageWallChange}
                    onPreview={handlePreview}
                    beforeUpload={() => false}
                    multiple
                >
                    {imageList.length < 20 && '+ Upload'}
                </Upload>
            </Form.Item>
            {previewImage && (
                <Image
                    wrapperStyle={{ display: 'none' }}
                    preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible: boolean) => setPreviewOpen(visible),
                        afterOpenChange: (visible: boolean) => !visible && setPreviewImage(''),
                    }}
                    src={previewImage}
                />
            )}
            <Form.Item
                label={<b>Description</b>}
                rules={[{ required: true, message: 'Please enter event description' }]}
            >
                <Editor
                    apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                    value={editorValue}
                    onEditorChange={val => setEditorValue(String(val ?? ''))}
                    init={{
                        height: 300,
                        menubar: false,
                        plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                        ],
                        toolbar: 'undo redo | blocks | ' +
                            'bold italic forecolor | alignleft aligncenter ' +
                            'alignright alignjustify | bullist numlist outdent indent | ' +
                            'removeformat | help',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                    }}
                />
            </Form.Item>
            {statusMessage && (
                <div style={{ textAlign: 'center', color: '#ff4d4f', marginBottom: 8 }}>
                    {statusMessage}
                </div>
            )}
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading || submitting} block>
                    {isUpdate ? 'Update Event' : 'Create Event'}
                </Button>
            </Form.Item>

        </Form >
    );
} 