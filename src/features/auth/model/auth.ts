import { Session } from "next-auth";
import { UserRole } from "@/types/next-auth";

export const hasRole = (session: Session | null, role: UserRole): boolean => {
    return session?.user?.roles?.includes(role) ?? false;
};

export const hasAnyRole = (session: Session | null, roles: UserRole[]): boolean => {
    return session?.user?.roles?.some(role => roles.includes(role)) ?? false;
};

export const hasAllRoles = (session: Session | null, roles: UserRole[]): boolean => {
    return roles.every(role => session?.user?.roles?.includes(role)) ?? false;
};

// Role hierarchy - higher roles have access to lower role pages
export const roleHierarchy: Record<UserRole, UserRole[]> = {
    ADMIN: ["ADMIN", "LECTURER", "STUDENT"],
    LECTURER: ["LECTURER", "STUDENT"],
    STUDENT: ["STUDENT"],
};

export const canAccessRole = (session: Session | null, targetRole: UserRole): boolean => {
    const userRoles = session?.user?.roles || [];
    return userRoles.some(role => roleHierarchy[role]?.includes(targetRole)) ?? false;
}; 