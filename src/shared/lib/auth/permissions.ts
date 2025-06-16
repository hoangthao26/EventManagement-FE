import { UserRole } from '@/types/next-auth';

type RoutePermissions = {
    [key: string]: UserRole[];
};

// Định nghĩa quyền truy cập cho từng route
const routePermissions: RoutePermissions = {
    '/admin': ['ADMIN'],
    '/organizer': ['LECTURER'], // Base permission - will be further checked for HEAD role
    '/registered-events': ['STUDENT', 'LECTURER'],
};

// Kiểm tra xem user có phải là HEAD của bất kỳ department nào không
export const isHeadOfAnyDepartment = (userDepartmentRoles: any[] = []) => {
    return userDepartmentRoles.some(dept => dept.roleName === 'HEAD');
};

// Kiểm tra quyền truy cập
export const checkPermission = (path: string, roles: UserRole[] = [], userDepartmentRoles: any[] = []) => {
    // Tìm route pattern phù hợp
    const matchedRoute = Object.keys(routePermissions).find(route =>
        path.startsWith(route)
    );

    if (!matchedRoute) return true; // Route không cần phân quyền

    const allowedRoles = routePermissions[matchedRoute];
    const hasBaseRole = roles.some(role => allowedRoles.includes(role));

    // Đặc biệt xử lý route /organizer
    if (matchedRoute.startsWith('/organizer')) {
        return hasBaseRole && isHeadOfAnyDepartment(userDepartmentRoles);
    }

    return hasBaseRole;
};

// Lấy route redirect dựa trên role
export const getRedirectRoute = (roles: UserRole[] = []) => {
    if (roles.includes('ADMIN')) return '/admin';
    if (roles.includes('LECTURER')) return '/organizer/my-events'; // Redirect về trang my-events
    if (roles.includes('STUDENT')) return '/my-events';
    return '/';
}; 