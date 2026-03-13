import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth-helpers";

export async function POST(req: Request) {
    try {
        const { password, hash } = await req.json();
        const isValid = await verifyPassword(password, hash);
        return NextResponse.json({ isValid });
    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
