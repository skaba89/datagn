import { Metadata, ResolvingMetadata } from 'next';
import prisma from '@/lib/db';
import PublicDashboardClient from './PublicDashboardClient';

type Props = {
    params: { token: string };
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const token = params.token;

    // En V2, on passe par le modèle ShareLink
    const shareLink = await prisma.shareLink.findUnique({
        where: { token: token },
        include: {
            dashboard: {
                include: { workspace: true }
            }
        },
    });

    if (!shareLink || !shareLink.dashboard) {
        return {
            title: 'Accès Restreint - DataGN',
        };
    }

    const db = shareLink.dashboard;
    const wsName = db.workspace?.name || 'DataGN IA';

    return {
        title: `${db.name} | Rapport Public DataGN`,
        description: `Consultez l'analyse de données interactive pour ${wsName}. Propulsé par l'IA d'analyse souveraine de Guinée.`,
        openGraph: {
            title: db.name,
            description: `Audit analytique de ${wsName}`,
            images: ['/og-image-dashboard.png'],
        },
    };
}

export default async function PublicDashboardPage({ params }: Props) {
    const shareLink = await prisma.shareLink.findUnique({
        where: { token: params.token },
        include: {
            dashboard: {
                include: {
                    workspace: true,
                    charts: {
                        include: {
                            chart: {
                                include: {
                                    datasetVersion: true
                                }
                            }
                        },
                        orderBy: { order: 'asc' }
                    }
                }
            }
        },
    });

    if (!shareLink || !shareLink.dashboard) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050E08', color: '#fff' }}>
                <div style={{ textAlign: 'center', maxWidth: 400, padding: 20 }}>
                    <div style={{ fontSize: 40, marginBottom: 15 }}>🚫</div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Accès restreint</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>
                        Ce dashboard n'existe pas ou n'est plus partagé publiquement.
                    </div>
                </div>
            </div>
        );
    }

    // Vérifier l'expiration
    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050E08', color: '#fff' }}>
                <div style={{ textAlign: 'center', maxWidth: 400, padding: 20 }}>
                    <div style={{ fontSize: 40, marginBottom: 15 }}>⏳</div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Lien expiré</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>
                        Ce lien de partage a expiré. Veuillez contacter l'administrateur pour obtenir un nouveau lien.
                    </div>
                </div>
            </div>
        );
    }

    // On passe les données au client component
    return <PublicDashboardClient db={JSON.parse(JSON.stringify(shareLink.dashboard))} />;
}
