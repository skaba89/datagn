import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Démarrage du bootstrap des dashboards...')

    const workspace = await prisma.workspace.findUnique({ where: { slug: 'datagn-demo' } })
    if (!workspace) {
        console.error('❌ Workspace datagn-demo non trouvé. Veuillez d\'abord exécuter le seed.')
        return
    }

    // 1. Création d'un Dataset simulé (CSV)
    const csvData = [
        "Date,Region,Produit,Ventes,Objectif,Satisfaction",
        "2026-01-01,Conakry,Solaire,1200,1000,85",
        "2026-01-02,Kindia,Solaire,800,900,80",
        "2026-01-03,Boke,Solaire,1500,1200,92",
        "2026-01-04,Conakry,Eolien,2000,1800,88",
        "2026-01-05,Mamou,Eolien,1100,1000,75",
        "2026-01-06,Kindia,Eolien,950,1100,70",
        "2026-01-07,Labé,Solaire,1300,1200,89"
    ].join('\n')

    const dataset = await prisma.dataset.create({
        data: {
            name: "Performance Commerciale 2026",
            sourceType: "upload",
            workspaceId: workspace.id,
            versions: {
                create: {
                    version: 1,
                    objectKey: "demo-dataset-2026.csv",
                    originalName: "performance_2026.csv",
                    contentType: "text/csv",
                    sizeBytes: 500,
                    rowCount: 7,
                    columnCount: 6,
                    status: "ready",
                }
            }
        },
        include: { versions: true }
    })

    const versionId = dataset.versions[0].id
    console.log(`✅ Dataset créé: ${dataset.name}`)

    // 2. Création du Dashboard "Vue Globale"
    const dashboardGlobal = await prisma.dashboard.create({
        data: {
            name: "Vue Globale (Cockpit)",
            description: "Vue d'ensemble de la performance stratégique",
            workspaceId: workspace.id,
            sourceType: "upload",
            config: {
                kpis: [
                    { name: 'Ventes Totales', colA: 'Ventes', op: '+', color: '#EDB025' },
                    { name: 'Satisfaction Moy.', colA: 'Satisfaction', op: 'AVG', color: '#3CA06A' }
                ],
                alerts: [],
                hiddenKPIs: []
            }
        }
    })

    // Graphique 1 : CA par Région (Bar)
    const chart1 = await prisma.chart.create({
        data: {
            name: "Ventes par Région",
            type: "bar",
            configJson: { x: "Region", y: "Ventes", color: "#3CA06A" },
            datasetVersionId: versionId,
            dashboards: { create: { dashboardId: dashboardGlobal.id, order: 0 } }
        }
    })

    // Graphique 2 : Satisfaction Client (Pie)
    await prisma.chart.create({
        data: {
            name: "Répartition Satisfaction",
            type: "pie",
            configJson: { x: "Region", y: "Satisfaction" },
            datasetVersionId: versionId,
            dashboards: { create: { dashboardId: dashboardGlobal.id, order: 1 } }
        }
    })

    console.log(`✅ Dashboard 'Vue Globale' créé avec 2 graphiques.`)

    // 3. Création du Dashboard "Analyse Locale"
    const dashboardLocal = await prisma.dashboard.create({
        data: {
            name: "Analyse Locale (Détail)",
            description: "Investigation approfondie des tendances régionales",
            workspaceId: workspace.id,
            sourceType: "upload",
            config: {
                kpis: [
                    { name: 'Écart Objectif', colA: 'Ventes', colB: 'Objectif', op: '-', color: '#8B5CF6' }
                ],
                alerts: [],
                hiddenKPIs: []
            }
        }
    })

    // Graphique 3 : Évolution temporelle (Line)
    await prisma.chart.create({
        data: {
            name: "Tendance des Ventes",
            type: "line",
            configJson: { x: "Date", y: "Ventes", showTarget: true, targetCol: "Objectif" },
            datasetVersionId: versionId,
            dashboards: { create: { dashboardId: dashboardLocal.id, order: 0 } }
        }
    })

    console.log(`✅ Dashboard 'Analyse Locale' créé.`)
    console.log('✨ Bootstrap terminé ! Actualisez la page.')
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
