export const EVENT_TYPES = [
    { label: 'Seminar', value: 'SEMINAR' },
    { label: 'Workshop', value: 'WORKSHOP' },
    { label: 'Orientation', value: 'ORIENTATION' },
] as const;

export const IMAGE_DIMENSIONS = {
    BANNER: {
        width: 1280,
        height: 720,
        label: '(1280x720)'
    },
    POSTER: {
        width: 720,
        height: 958,
        label: '(720x958)'
    },
    AVATAR: {
        width: 400,
        height: 400,
        label: '(400x400)'
    }
} as const; 
