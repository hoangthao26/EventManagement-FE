'use client';

import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { UploadProps } from 'antd/es/upload/interface';
import { IMAGE_DIMENSIONS } from '../lib/constants';

interface ImageUploadProps {
    type: 'POSTER' | 'BANNER';
    value?: File | string;
    onChange?: (file: File | null) => void;
    children?: React.ReactNode;
    height?: number;
}

export function ImageUpload({ type, value, onChange, children, height = 400 }: ImageUploadProps) {
    const [imageFile, setImageFile] = useState<File | null>(typeof value === 'string' ? null : value || null);
    const [imageUrl, setImageUrl] = useState<string>(typeof value === 'string' ? value : value ? URL.createObjectURL(value) : '');
    const [isHovered, setIsHovered] = useState(false);

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
        setImageFile(file);
        setImageUrl(URL.createObjectURL(file));
        onChange?.(file);
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
                position: 'relative',
            }}
        >
            {imageUrl ? (
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        borderRadius: 8,
                        background: '#f6f6f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <img
                        src={imageUrl}
                        alt="upload"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                            display: 'block',
                            background: '#f6f6f6',
                        }}
                    />
                    {isHovered && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'rgba(0, 0, 0, 0.5)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'background 0.3s ease',
                            }}
                        >
                            <InboxOutlined style={{ fontSize: 40, color: '#fff', marginBottom: 8 }} />
                            <span style={{ color: '#fff', fontSize: '16px' }}>Click to reupload</span>
                        </div>
                    )}
                </div>
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