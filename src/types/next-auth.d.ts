import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

export type UserRole = "ADMIN" | "LECTURER" | "STUDENT";

declare module "next-auth" {
    interface Session extends DefaultSession {
        accessToken?: string;
        refreshToken?: string;
        user: {
            id?: string;
            email?: string;
            name?: string;
            image?: string;
            roles?: UserRole[];
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        user?: {
            id?: string;
            email?: string;
            name?: string;
            image?: string;
            roles?: UserRole[];
        }
    }
} 