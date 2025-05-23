import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Nếu chưa đăng nhập, chuyển về trang login
        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        const roles = token.user?.roles || [];

        // Kiểm tra quyền truy cập cho các route admin
        if (path.startsWith("/admin")) {
            if (!roles.includes("ADMIN")) {
                return NextResponse.redirect(new URL("/unauthorized", req.url));
            }
        }

        // Kiểm tra quyền truy cập cho các route organizer
        if (path.startsWith("/organizer")) {
            if (!roles.includes("LECTURER")) {
                return NextResponse.redirect(new URL("/unauthorized", req.url));
            }
        }

        // Kiểm tra quyền truy cập cho các route my-events
        if (path.startsWith("/my-events")) {
            if (!roles.includes("STUDENT") && !roles.includes("LECTURER")) {
                return NextResponse.redirect(new URL("/unauthorized", req.url));
            }
        }

        // Kiểm tra quyền truy cập cho trang checkin
        if (path.startsWith("/checkin")) {
            if (!roles.includes("LECTURER")) {
                return NextResponse.redirect(new URL("/unauthorized", req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
    }
);

// Các route cần được bảo vệ
export const config = {
    matcher: [
        "/admin/:path*",
        "/organizer/:path*",
        "/my-events/:path*",
        "/checkin/:path*",
        "/events/:path*/bookings"
    ]
}; 