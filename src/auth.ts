import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import Keycloak from "next-auth/providers/keycloak";
import prisma from "@/lib/db";
import { verifyPassword } from "@/lib/auth-helpers";

// Ensure AUTH_SECRET is set for NextAuth v5
if (!process.env.AUTH_SECRET && process.env.NEXTAUTH_SECRET) {
    process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET;
}

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    ...authConfig,
    debug: process.env.NODE_ENV === "development", // 🛠️ Activation des logs détaillés
    providers: [
        Keycloak({
            clientId: process.env.KEYCLOAK_CLIENT_ID || "datagn-web",
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "change-me",
            issuer: process.env.KEYCLOAK_ISSUER,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    console.log("[Auth] Tentative de connexion locale pour:", credentials.email);
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email as string },
                    });

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
                if (account.provider === "keycloak" && profile) {
                    extId = profile.sub as string;
                } else if (account.provider === "credentials") {
                    extId = `local-${user.email}`;
                }

                token.externalId = extId;

                try {
                    // Sync avec la DB pour garantir les liens Workspace/Membership
                    const dbUser = await prisma.user.upsert({
                        where: { email: user.email as string },
                        update: {
                            name: user.name,
                            externalId: extId,
                        },
                        create: {
                            email: user.email as string,
                            name: user.name,
                            externalId: extId,
                        },
                    });
                    token.id = dbUser.id;
                    console.log("[Auth] Utilisateur synchronisé en DB, ID:", dbUser.id);
                } catch (e) {
                    console.error('[AUTH_SYNC_ERROR] Sync impossible, passage en mode dégradé:', e);
                    token.id = user.id || extId;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).externalId = token.externalId;
            }
            return session;
        },
    }
});
