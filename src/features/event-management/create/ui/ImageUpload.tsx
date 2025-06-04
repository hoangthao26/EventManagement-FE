'use client';

import { Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { UploadProps } from 'antd/es/upload/interface';
import { IMAGE_DIMENSIONS } from '../lib/constants';
import styles from '../styles/ImageUpload.module.css';
import { useAntdMessage } from '@/shared/lib/hooks/useAntdMessage';

interface ImageUploadProps {
    type: 'POSTER' | 'BANNER' | 'AVATAR';
    value?: File | string;
    onChange?: (file: File | null) => void;
    children?: React.ReactNode;
    height?: number;
}

export function ImageUpload({ type, value, onChange, children, height = 400 }: ImageUploadProps) {
    const [imageFile, setImageFile] = useState<File | null>(typeof value === 'string' ? null : value || null);
    const [imageUrl, setImageUrl] = useState<string>(typeof value === 'string' ? value : value ? URL.createObjectURL(value) : '');
    const [isHovered, setIsHovered] = useState(false);
    const { showError } = useAntdMessage();

    const beforeUpload: UploadProps['beforeUpload'] = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            showError('You can only upload image files!');
            return false;
        }
        const isCorrectSize = file.size / 1024 / 1024 < 2;
        if (!isCorrectSize) {
            showError('Image must be smaller than 2MB!');
            return false;
        }

        // Check image dimensions
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const dimensions = IMAGE_DIMENSIONS[type];
                if (img.width !== dimensions.width || img.height !== dimensions.height) {
                    showError(`Image dimensions must be exactly ${dimensions.label}. Current size: ${img.width}x${img.height}`);
                    reject(false);
                    return;
                }
                setImageFile(file);
                setImageUrl(URL.createObjectURL(file));
                onChange?.(file);
                resolve(false);
            };
            img.onerror = () => {
                showError('Failed to load image. Please try again.');
                reject(false);
            };
        });
    };

    return (
        <Upload.Dragger
            name="file"
            listType="picture-card"
            showUploadList={false}
            beforeUpload={beforeUpload}
            className={styles.uploadButton}
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
                    style={{ position: 'relative', width: '100%', height: '100%' }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <img
                        src={imageUrl}
                        alt="upload"
                        style={{
                            width: '100%',
                            height: 350,
                            maxHeight: 350,
                            objectFit: 'cover',
                            transition: 'filter 0.3s ease',
                            borderRadius: 4
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
                                borderRadius: 4
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
                    {children || (
                        <>
                            <span style={{ color: '#fa8c16', fontSize: '14px', marginBottom: 4 }}>
                                {type === 'BANNER' ? 'Upload Banner Image' : type === 'AVATAR' ? 'Upload Avatar Image' : 'Upload Poster Image'}
                            </span>
                            <span style={{ color: '#8c8c8c', fontSize: '14px' }}>
                                {IMAGE_DIMENSIONS[type].label}
                            </span>
                        </>
                    )}
                </div>
            )}
        </Upload.Dragger>
    );
} 