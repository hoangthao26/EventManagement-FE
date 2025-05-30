import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { checkPermission, getRedirectRoute } from '@/shared/lib/auth/permissions';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const isAuthPage = request.nextUrl.pathname.startsWith('/login');

    if (isAuthPage) {
        if (token) {
            const roles = token.user?.roles || [];
            const redirectUrl = getRedirectRoute(roles);
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Kiểm tra quyền truy cập
    const roles = token.user?.roles || [];
    const userDepartmentRoles = token.user?.userDepartmentRoles || [];
    const hasPermission = checkPermission(request.nextUrl.pathname, roles, userDepartmentRoles);

    if (!hasPermission) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
}

// Chỉ áp dụng middleware cho các routes cần bảo vệ
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
}; 