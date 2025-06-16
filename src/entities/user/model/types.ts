export type UserRole = "ADMIN" | "LECTURER" | "STUDENT";

export interface UserDepartmentRole {
    departmentCode: string;
    departmentName: string;
    roleName: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    roles: UserRole[];
    userDepartmentRoles: UserDepartmentRole[];
    accessToken?: string;
    refreshToken?: string;
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    image?: string;
    roles: UserRole[];
    userDepartmentRoles: UserDepartmentRole[];
}

export interface UpdateUserProfileData {
    name?: string;
    image?: string;
} 