import { UserRole } from "@/types/next-auth";

export interface AuthResponse {
    token: string;
    refreshToken: string;
    id?: string;
    email: string;
    fullName: string;
    roles: UserRole[];
    userDepartmentRoles: any[];
}

export interface ProfileData {
    id: string;
    email: string;
    fullName: string;
    roles: UserRole[];
    userDepartmentRoles: any[];
}

export interface UpdateProfileData {
    fullName?: string;
    // Add other fields that can be updated
} 