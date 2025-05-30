import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";
import { UserRole } from "@/types/next-auth";

// Tạo instance axios với timeout dài hơn cho NextAuth
const authAxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000, // Tăng timeout cho NextAuth
    headers: {
        'Content-Type': 'application/json'
    }
});

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
    ],
    callbacks: {
        async signIn({ account, profile }) {
            if (account?.provider === "google") {
                try {
                    // Log idToken từ Google
                    console.log('Google idToken:', {
                        idToken: account.id_token,
                    });

                    // Send id_token to backend for verification
                    const response = await authAxiosInstance.post(
                        '/auth/google',
                        {
                            idToken: account.id_token
                        }
                    );

                    // Log response từ backend
                    console.log('Backend Auth Response:', {
                        token: response.data.token,
                        refreshToken: response.data.refreshToken,
                        type: response.data.type,
                        id: response.data.id,
                        email: response.data.email,
                        fullName: response.data.fullName,
                        roles: response.data.roles,
                        userDepartmentRoles: response.data.userDepartmentRoles
                    });

                    if (response.data) {
                        // Store tokens and user info
                        account.access_token = response.data.token;
                        account.refresh_token = response.data.refreshToken;
                        account.user = {
                            id: response.data.id?.toString(),
                            email: response.data.email,
                            name: response.data.fullName,
                            image: (profile as any)?.picture,
                            roles: response.data.roles as UserRole[],
                            userDepartmentRoles: response.data.userDepartmentRoles
                        };

                        return true;
                    }
                } catch (error: any) {
                    console.error("Authentication error:", {
                        message: error.message,
                        response: error.response?.data,
                        status: error.response?.status
                    });
                    return false;
                }
            }
            return false;
        },
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.user = account.user as {
                    id?: string;
                    email?: string;
                    name?: string;
                    image?: string;
                    roles?: UserRole[];
                    userDepartmentRoles?: any[];
                };
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.accessToken = token.accessToken;
                session.refreshToken = token.refreshToken;
                session.user = {
                    ...session.user,
                    ...token.user
                };
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
        error: "/error",
    },
    session: {
        strategy: "jwt",
        maxAge: 2 * 24 * 60 * 60, // 2 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: false,
});

export { handler as GET, handler as POST }; 