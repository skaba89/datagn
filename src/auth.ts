import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/db";
import { verifyPassword } from "@/lib/auth-helpers";

// Ensure AUTH_SECRET is set for NextAuth v5
if (!process.env.AUTH_SECRET && process.env.NEXTAUTH_SECRET) {
    process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET;
}

// Fallback secret for development
if (!process.env.AUTH_SECRET) {
    process.env.AUTH_SECRET = "datagn-dev-secret-key-minimum-32-chars-for-testing";
    console.warn("[Auth] Using fallback AUTH_SECRET for development");
}

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    ...authConfig,
    debug: process.env.NODE_ENV === "development",
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    console.log("[Auth] Tentative de connexion pour:", credentials.email);
                    
                    // Try to connect to database
                    let user;
                    try {
                        user = await prisma.user.findUnique({
                            where: { email: credentials.email as string },
                        });
                    } catch (dbError) {
                        console.error("[Auth] Erreur de connexion DB:", dbError);
                        // For demo purposes, allow a test user when DB is unavailable
                        if (credentials.email === "demo@datagn.com" && credentials.password === "demo123") {
                            return {
                                id: "demo-user",
                                name: "Demo User",
                                email: "demo@datagn.com",
                            };
                        }
                        return null;
                    }

                    if (!user || !user.password) {
                        console.warn("[Auth] Utilisateur non trouvé ou sans mot de passe");
                        return null;
                    }

                    const isValid = await verifyPassword(credentials.password as string, user.password);

                    if (isValid) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                        };
                    }
                    console.warn("[Auth] Mot de passe incorrect");
                } catch (error) {
                    console.error("[AUTH_AUTHORIZE_ERROR]", error);
                    return null;
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account, profile }) {
            // Initial sign in
            if (account && user) {
                console.log("[Auth] Sign-in détecté pour provider:", account.provider);

                let extId = "";
                if (account.provider === "credentials") {
                    extId = `local-${user.email}`;
                }

                token.externalId = extId;

                try {
                    // Sync avec la DB
                    const dbUser = await prisma.user.upsert({
                        where: { email: user.email as string },
                        update: {
                            name: user.name,
                            externalId: extId,
                        },
                        create: {
                            email: user.email as string,
                            name: user.name || "User",
                            externalId: extId,
                        },
                    });
                    token.id = dbUser.id;
                    console.log("[Auth] Utilisateur synchronisé en DB, ID:", dbUser.id);
                } catch (e) {
                    console.warn('[AUTH_SYNC_ERROR] Sync impossible:', e);
                    token.id = user.id || extId;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id || token.sub;
                (session.user as any).externalId = token.externalId;
            }
            return session;
        },
    }
});
