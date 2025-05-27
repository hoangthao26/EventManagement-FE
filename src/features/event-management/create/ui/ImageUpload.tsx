'use client';

import { Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined, InboxOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { IMAGE_DIMENSIONS } from '../lib/constants';

interface ImageUploadProps {
    type: 'POSTER' | 'BANNER';
    value?: string;
    onChange?: (url: string) => void;
    children?: React.ReactNode;
    height?: number;
}

export function ImageUpload({ type, value, onChange, children, height = 400 }: ImageUploadProps) {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>(value || '');

    const dimensions = IMAGE_DIMENSIONS[type];

    const handleUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

        try {
            setLoading(true);
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await response.json();
            if (data.secure_url) {
                setImageUrl(data.secure_url);
                onChange?.(data.secure_url);
                message.success('Upload successful');
            }
        } catch (error) {
            message.error('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const beforeUpload: UploadProps['beforeUpload'] = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('You can only upload image files!');
            return false;
        }

        const isCorrectSize = file.size / 1024 / 1024 < 2;
        if (!isCorrectSize) {
            message.error('Image must be smaller than 2MB!');
            return false;
        }

        handleUpload(file);
        return false;
    };

    return (
        <Upload.Dragger
            name="file"
            listType="picture-card"
            showUploadList={false}
            beforeUpload={beforeUpload}
            style={{
                width: '100%',
                height: height,
                minHeight: height,
                display: 'flex',
                alignItems: 'stretch',
            }}
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt="upload"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        minHeight: height,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <InboxOutlined style={{ fontSize: 40, color: '#fa8c16', marginBottom: 8 }} />
                    {children}
                </div>
            )}
        </Upload.Dragger>
    );
} 