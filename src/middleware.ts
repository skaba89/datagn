import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

const publicRoutes = ["/", "/login", "/register", "/p", "/api/kadi"];

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    // 🚀 Laisse passer les assets statiques et APIs publiques pour éviter les erreurs de console
    const isStatic = nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|json|js|css)$/) ||
        nextUrl.pathname.startsWith("/_next") ||
        nextUrl.pathname.startsWith("/api/share");

    if (isStatic) return null;

    // Vérifier si c'est une route publique
    const isPublicRoute = publicRoutes.some(route =>
        nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`)
    );

    if (isPublicRoute) {
        if (isLoggedIn && nextUrl.pathname === "/login") {
            return Response.redirect(new URL("/", nextUrl));
        }
        return null;
    }

    // Redirection vers login si non connecté et route protégée
    if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
    }

    return null;
});

// Configure where the middleware should run
export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)"],
};
