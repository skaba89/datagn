import Stripe from 'stripe';

// On utilise une clé "dummy" par défaut pour que le `next build` dans Docker passe même si STRIPE_SECRET_KEY n'est pas défini
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build', {
    apiVersion: '2026-02-25.clover', // Utilisation de la version attendue par le SDK
    typescript: true,
});
