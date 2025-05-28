export const EVENT_TYPES = [
    { label: 'Seminar', value: 'SEMINAR' },
    { label: 'Workshop', value: 'WORKSHOP' },
    { label: 'Orientation', value: 'ORIENTATION' },
] as const;

export const IMAGE_DIMENSIONS = {
    POSTER: {
        width: 720,
        height: 958,
        aspectRatio: 720 / 958,
    },
    BANNER: {
        width: 1280,
        height: 720,
        aspectRatio: 1280 / 720,
    },
} as const; 