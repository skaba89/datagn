import { signOut, auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST() {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ message: "Not logged in" }, { status: 401 });
    }

    // Destruction de la session NextAuth
    // Note: Pour un vrai "Federated Logout" OIDC avec Keycloak, il faudrait rediriger
    // vers l'endpoint de fin de session Keycloak avec l'id_token_hint.
    await signOut({ redirect: false });

    return NextResponse.json({ message: "Successfully logged out" });
}
