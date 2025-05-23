import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "@/types/next-auth";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Define role-based access rules
        const roleAccess: Record<string, UserRole[]> = {
            "/admin": ["ADMIN"],
            "/lecturer": ["ADMIN", "LECTURER"],
            "/student": ["ADMIN", "LECTURER", "STUDENT"],
        };

        // Check if the path requires specific roles
        for (const [route, allowedRoles] of Object.entries(roleAccess)) {
            if (path.startsWith(route)) {
                const userRoles = token?.user?.roles || [];
                const hasAccess = userRoles.some(role => allowedRoles.includes(role as UserRole));

                if (!hasAccess) {
                    return NextResponse.redirect(new URL("/unauthorized", req.url));
                }
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        "/admin/:path*",
        "/lecturer/:path*",
        "/student/:path*",
    ],
}; 