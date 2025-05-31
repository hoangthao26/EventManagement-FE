import React from 'react';
import { Input } from 'antd';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = 'Tìm kiếm', style }) => {
    return (
        <Input.Search
            placeholder={placeholder}
            allowClear
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            style={style}
        />
    );
}; 