import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get('Stripe-Signature') as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        console.error(`[WEBHOOK_ERROR] ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    if (event.type === 'checkout.session.completed') {
        const workspaceId = session.metadata.workspaceId;
        const plan = session.metadata.plan;

        if (!workspaceId || !plan) {
            return new NextResponse('Missing metadata', { status: 400 });
        }

        // En V2, nous n'avons pas de champ 'plan' direct sur le Workspace.
        // L'abonnement est géré via les logs d'audit et potentiellement un modèle Subscription futur.
        // Pour l'instant, nous confirmons simplement le succès du paiement.

        // Logger l'audit avec les détails du plan
        await prisma.auditLog.create({
            data: {
                workspaceId,
                userId: session.metadata.userId,
                action: "PAYMENT_SUCCESS",
                entityType: "Workspace",
                entityId: workspaceId,
                metaJson: { plan, stripeSessionId: session.id },
            }
        });

        console.log(`[BILLING] Workspace ${workspaceId} payment received for plan ${plan}`);
    }

    return new NextResponse(null, { status: 200 });
}
