'use client';

import { App, ConfigProvider } from 'antd';
import { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface AntdProviderProps {
    children: ReactNode;
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
    return (
        <div role="alert" className="p-4">
            <p className="text-red-500">Something went wrong:</p>
            <pre className="text-sm text-gray-600">{error.message}</pre>
            <button
                onClick={resetErrorBoundary}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Try again
            </button>
        </div>
    );
}

export function AntdProvider({ children }: AntdProviderProps) {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: "#fa8c16",
                    },
                }}
            >
                <App>
                    {children}
                </App>
            </ConfigProvider>
        </ErrorBoundary>
    );
} 