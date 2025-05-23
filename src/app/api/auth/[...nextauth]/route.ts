import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";
import { UserRole } from "@/types/next-auth";

// Tạo instance axios với timeout dài hơn
const api = axios.create({
    timeout: 10000, // 10 seconds
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
                    // Send id_token to backend for verification
                    const response = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`,
                        {
                            idToken: account.id_token
                        }
                    );

                    if (response.data) {
                        // Store tokens and user info
                        account.access_token = response.data.token;
                        account.refresh_token = response.data.refreshToken;
                        account.user = {
                            id: response.data.id?.toString(),
                            email: response.data.email,
                            name: response.data.fullName,
                            image: (profile as any)?.picture,
                            roles: response.data.roles as UserRole[]
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
        },
    },
    pages: {
        signIn: "/login",
        error: "/error",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST }; 