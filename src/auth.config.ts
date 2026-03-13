import { NextAuthConfig } from "next-auth";

// authConfig contient uniquement la configuration compatible avec l'Edge Runtime (Middleware)
// Les providers (Keycloak, Credentials avec Prisma) sont définis dans auth.ts pour éviter les erreurs 
// de module Node.js non supportés en Edge.
export const authConfig: NextAuthConfig = {
    providers: [], // Sera complété dans auth.ts
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account && profile) {
                token.externalId = profile.sub;
                token.email = profile.email;
                token.name = profile.name || (profile as any).preferred_username;
            }
            if (account?.provider === "credentials" && token.email) {
                // externalId sera déjà géré par l'authorize dans auth.ts via user.id
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).externalId = token.externalId;
                (session.user as any).id = token.sub; // sub contient l'id retourné par authorize ou keycloak profil.sub
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
};
