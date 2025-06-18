import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/next-auth";
import { useEffect } from "react";
import { authApi } from "../api/authApi";
import { jwtDecode } from "jwt-decode";

export const useAuth = () => {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    // Check if token is expired
    const isTokenExpired = (token: string): boolean => {
        try {
            const decoded = jwtDecode<{ exp: number }>(token);
            const expiry = decoded.exp * 1000;
            const now = Date.now();
            return now >= expiry;
        } catch (error) {
            return true;
        }
    };

    // Check if session is valid
    const isSessionValid = () => {
        if (!session?.accessToken) return false;
        return !isTokenExpired(session.accessToken);
    };

    // Force logout when token is invalid
    const forceLogout = async () => {
        try {
            // Clear local storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            // Sign out from next-auth
            await signOut({ redirect: false });

            // Redirect to login
            router.push("/login");
        } catch (error) {
            console.error("Force logout error:", error);
            router.push("/login");
        }
    };

    // Check session validity on mount and when session changes
    useEffect(() => {
        if (status === "authenticated" && !isSessionValid()) {
            forceLogout();
        }
    }, [status, session]);

    const login = async () => {
        try {
            const result = await signIn("google", {
                redirect: false,
                callbackUrl: "/"
            });

            // Log ở client-side (DevTools)
            console.log('Google Auth Client Response:', {
                status: result?.ok ? 'success' : 'error',
                error: result?.error,
                url: result?.url
            });

            if (result?.error) {
                console.error("Login error:", result.error);
                return false;
            }

            // Sau khi đăng nhập thành công, chuyển hướng dựa trên role
            if (result?.ok) {
                const roles = session?.user?.roles;
                if (roles?.includes("ADMIN")) {
                    router.push("/admin");
                } else if (roles?.includes("LECTURER") || roles?.includes("STUDENT")) {
                    router.push("/");
                } else {
                    router.push("/unauthorized");
                }
            }

            return true;
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    };

    const logout = async () => {
        try {
            const refreshToken = session?.refreshToken;
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            // Call backend API to logout
            await authApi.logout(refreshToken);

            // Clear local storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            // Sign out from next-auth
            await signOut({ redirect: false });

            // Redirect to login page
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
            // Even if API call fails, still clear local session
            await signOut({ redirect: false });
            router.push("/login");
        }
    };

    const redirectBasedOnRole = () => {
        if (!session?.user?.roles) {
            console.log('No roles found, redirecting to unauthorized');
            router.push("/unauthorized");
            return;
        }

        const roles = session.user.roles;
        const currentPath = window.location.pathname;


        // Nếu đang ở trang root hoặc login, chuyển hướng dựa trên role
        if (currentPath === "/" || currentPath === "/login") {
            if (roles.includes("ADMIN")) {
                console.log('Admin role detected, redirecting to admin');
                router.push("/admin");
            } else if (roles.includes("LECTURER") || roles.includes("STUDENT")) {
                console.log('Lecturer/Student role detected, staying on home page');
                // Don't redirect if already on home page
                if (currentPath !== "/") {
                    router.push("/");
                }
            } else {
                console.log('No valid role detected, redirecting to unauthorized');
                router.push("/unauthorized");
            }
            return;
        }

        // Kiểm tra quyền truy cập trang hiện tại
        if (currentPath.startsWith("/admin") && !roles.includes("ADMIN")) {
            router.push("/unauthorized");
        } else if (currentPath.startsWith("/organizer") && !roles.includes("LECTURER")) {
            router.push("/unauthorized");
        }
    };

    const hasRole = (role: UserRole) => {
        return session?.user?.roles?.includes(role) ?? false;
    };

    const hasAnyRole = (roles: UserRole[]) => {
        return session?.user?.roles?.some(role => roles.includes(role)) ?? false;
    };

    const getRoleBasedPath = () => {
        if (!session?.user?.roles) return "/unauthorized";

        const roles = session.user.roles;
        if (roles.includes("ADMIN")) return "/admin";
        if (roles.includes("LECTURER") || roles.includes("STUDENT")) return "/";
        return "/unauthorized";
    };

    return {
        session,
        status,
        login,
        logout,
        forceLogout,
        redirectBasedOnRole,
        hasRole,
        hasAnyRole,
        getRoleBasedPath,
        isAuthenticated: !!session && isSessionValid(),
        isLoading: status === "loading"
    };
}; 