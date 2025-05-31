import { App } from 'antd';
import { useCallback } from 'react';

interface MessageOptions {
    duration?: number;
    style?: React.CSSProperties;
}

export const useAntdMessage = () => {
    const { message } = App.useApp();

    const showSuccess = useCallback((content: string, options?: MessageOptions) => {
        message.success({
            content,
            duration: options?.duration ?? 3,
            style: {
                ...options?.style,
            },
        });
    }, [message]);

    const showError = useCallback((content: string, options?: MessageOptions) => {
        message.error({
            content,
            duration: options?.duration ?? 4,
            style: {
                ...options?.style,
            },
        });
    }, [message]);

    const showWarning = useCallback((content: string, options?: MessageOptions) => {
        message.warning({
            content,
            duration: options?.duration ?? 3,
            style: {
                ...options?.style,
            },
        });
    }, [message]);

    const showInfo = useCallback((content: string, options?: MessageOptions) => {
        message.info({
            content,
            duration: options?.duration ?? 3,
            style: {
                ...options?.style,
            },
        });
    }, [message]);

    return {
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };
}; 