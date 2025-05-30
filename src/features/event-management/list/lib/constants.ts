import { EventStatus } from '../model/types';

export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
    DRAFT: 'default',
    PUBLISHED: 'processing',
    ONGOING: 'success',
    COMPLETED: 'default',
    CANCELLED: 'error',
    BLOCKED: 'error',
};

export const AUDIENCE_COLORS: Record<string, string> = {
    STUDENT: 'blue',
    LECTURER: 'purple',
    BOTH: 'geekblue',
};

export const MODE_COLORS: Record<string, string> = {
    ONLINE: 'green',
    OFFLINE: 'orange',
    HYBRID: 'red',
}; 