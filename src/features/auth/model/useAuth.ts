import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/next-auth";
import { useEffect } from "react";

export const useAuth = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const login = async () => {
        try {
            const result = await signIn("google", {
                redirect: false,
                callbackUrl: "/"
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
                } else if (roles?.includes("LECTURER")) {
                    router.push("/lecturer");
                } else if (roles?.includes("STUDENT")) {
                    router.push("/student");
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
        await signOut({ redirect: false });
        router.push("/login");
    };

    const redirectBasedOnRole = () => {
        if (!session?.user?.roles) {
            router.push("/unauthorized");
            return;
        }

        const roles = session.user.roles;
        const currentPath = window.location.pathname;

        // Nếu đang ở trang root hoặc login, chuyển hướng dựa trên role
        if (currentPath === "/" || currentPath === "/login") {
            if (roles.includes("ADMIN")) {
                router.push("/admin");
            } else if (roles.includes("LECTURER")) {
                router.push("/lecturer");
            } else if (roles.includes("STUDENT")) {
                router.push("/student");
            } else {
                router.push("/unauthorized");
            }
            return;
        }

        // Kiểm tra quyền truy cập trang hiện tại
        if (currentPath.startsWith("/admin") && !roles.includes("ADMIN")) {
            router.push("/unauthorized");
        } else if (currentPath.startsWith("/lecturer") && !roles.includes("LECTURER")) {
            router.push("/unauthorized");
        } else if (currentPath.startsWith("/student") && !roles.includes("STUDENT")) {
            router.push("/unauthorized");
        }
    };

    // Thêm useEffect để theo dõi thay đổi session
    useEffect(() => {
        if (status === "authenticated" && session?.user?.roles) {
            redirectBasedOnRole();
        } else if (status === "unauthenticated" && window.location.pathname !== "/login") {
            router.push("/login");
        }
    }, [status, session]);

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
        if (roles.includes("LECTURER")) return "/lecturer";
        if (roles.includes("STUDENT")) return "/student";
        return "/unauthorized";
    };

    return {
        session,
        status,
        login,
        logout,
        redirectBasedOnRole,
        hasRole,
        hasAnyRole,
        getRoleBasedPath,
        isAuthenticated: !!session,
        isLoading: status === "loading"
    };
}; 