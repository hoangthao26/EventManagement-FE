import { UserRole } from '@/types/next-auth';

type RoutePermissions = {
    [key: string]: UserRole[];
};

// Định nghĩa các route và role được phép truy cập
export const routePermissions: RoutePermissions = {
    '/admin': ['ADMIN'],
    '/organizer': ['LECTURER'],
    '/my-events': ['STUDENT', 'LECTURER'],
    '/checkin': ['LECTURER'],
    '/events': ['STUDENT', 'LECTURER', 'ADMIN']
};

// Kiểm tra quyền truy cập
export const checkPermission = (path: string, roles: UserRole[] = []) => {
    // Tìm route pattern phù hợp
    const matchedRoute = Object.keys(routePermissions).find(route =>
        path.startsWith(route)
    );

    if (!matchedRoute) return true; // Route không cần phân quyền

    const allowedRoles = routePermissions[matchedRoute];
    return roles.some(role => allowedRoles.includes(role));
};

// Lấy route redirect dựa trên role
export const getRedirectRoute = (roles: UserRole[] = []) => {
    if (roles.includes('ADMIN')) return '/admin';
    if (roles.includes('LECTURER')) return '/organizer';
    if (roles.includes('STUDENT')) return '/my-events';
    return '/';
}; 