import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

        const { plan, workspaceId } = await req.json();

        if (!plan || !workspaceId) {
            return new NextResponse('Missing parameters', { status: 400 });
        }

        // Dans une vraie app, on utiliserait des Price IDs Stripe configurés dans le Dashboard Stripe
        // Ici on simule pour la démonstration SaaS
        const prices: Record<string, { amount: number, name: string }> = {
            IMPACT: { amount: 4900, name: 'Plan Impact' }, // 49.00 USD (Exemple)
            ENTERPRISE: { amount: 14900, name: 'Plan Enterprise' }, // 149.00 USD
        };

        const selected = prices[plan as keyof typeof prices];
        if (!selected) return new NextResponse('Invalid plan', { status: 400 });

        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: selected.name,
                            description: `Abonnement DataGN pour le Workspace ${workspaceId}`,
                        },
                        unit_amount: selected.amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment', // Pour un abonnement récurrent on utiliserait 'subscription'
            success_url: `${req.headers.get('origin')}/billing?success=true`,
            cancel_url: `${req.headers.get('origin')}/billing?canceled=true`,
            metadata: {
                workspaceId,
                plan,
                userId: session.user.id as string,
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error('[STRIPE_ERROR]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
