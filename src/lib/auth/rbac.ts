import { auth } from "@/auth";
import prisma from "@/lib/db";
import { WorkspaceRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function requireAuth() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("UNAUTHORIZED");
    }
    return session.user;
}

export async function requireRole(workspaceId: string, allowedRoles: WorkspaceRole[]) {
    const user = await requireAuth();

    const membership = await prisma.membership.findUnique({
        where: {
            userId_workspaceId: {
                userId: user.id as string,
                workspaceId,
            }
        }
    });

    if (!membership) {
        throw new Error("FORBIDDEN: Not a member");
    }

    if (!allowedRoles.includes(membership.role)) {
        throw new Error("FORBIDDEN: Insufficient permissions");
    }

    return { user, membership };
}

export function handleAuthError(error: any) {
    if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message.startsWith("FORBIDDEN")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[AUTH_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
