import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exporte un élément DOM en PDF haute qualité
 * @param elementId ID de l'élément à capturer
 * @param fileName Nom du fichier de sortie
 */
/**
 * Génère un rapport PDF structuré (Enterprise Grade)
 */
export async function generateEnterpriseReport({
    title, author, data, viz, options
}: {
    title: string; author: string; data: any[]; viz: any;
    options: { includeCover: boolean; includeSummary: boolean; includeCharts: boolean; includeTable: boolean }
}) {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const primaryColor = '#EDB025';

    let currentPage = 1;

    const addFooter = () => {
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(`DataGN Enterprise Report | ${title} | Page ${currentPage}`, 15, pageHeight - 10);
        pdf.text(`${new Date().toLocaleDateString()}`, pageWidth - 30, pageHeight - 10);
    };

    // --- PAGE DE GARDE ---
    if (options.includeCover) {
        // Fond stylisé
        pdf.setFillColor(5, 14, 8);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        pdf.setTextColor(255);
        pdf.setFontSize(32);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title.toUpperCase(), 15, 80);

        pdf.setDrawColor(primaryColor);
        pdf.setLineWidth(2);
        pdf.line(15, 90, 60, 90);

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        pdf.text('RAPPORT D\'ANALYSE COMPLEXE', 15, 105);

        pdf.setTextColor(primaryColor);
        pdf.text(author || 'DataGN AI Solutions', 15, 115);

        pdf.setTextColor(100);
        pdf.setFontSize(10);
        pdf.text('Généré de manière souveraine en République de Guinée.', 15, pageHeight - 20);

        pdf.addPage();
        currentPage++;
    }

    // --- SOMMAIRE / RÉSUMÉ ---
    if (options.includeSummary) {
        pdf.setTextColor(30);
        pdf.setFontSize(22);
        pdf.text('Résumé Exécutif', 15, 25);

        pdf.setFontSize(11);
        pdf.setTextColor(80);
        const intro = `Ce rapport présente une analyse approfondie des données issues du dashboard "${title}". Au total, ${data.length} indicateurs ont été traités avec une granularité métier multi-dimensionnelle.`;
        pdf.text(pdf.splitTextToSize(intro, pageWidth - 30), 15, 40);

        const statsY = 60;
        pdf.setFontSize(14);
        pdf.setTextColor(30);
        pdf.text('Statistiques Globales', 15, statsY);

        pdf.setFontSize(10);
        pdf.text(`- Volume de données: ${data.length} entrées`, 20, statsY + 10);
        pdf.text(`- KPIs identifiés: ${viz.kpis.length}`, 20, statsY + 18);

        addFooter();
        pdf.addPage();
        currentPage++;
    }

    // --- GRAPHIQUES ---
    if (options.includeCharts) {
        const dashboardElement = document.getElementById('dashboard-content');
        if (dashboardElement) {
            const canvas = await html2canvas(dashboardElement, {
                scale: 1.5,
                ignoreElements: (node: Element) => node.tagName === 'BUTTON' || node.classList?.contains('no-export')
            });
            const imgData = canvas.toDataURL('image/jpeg', 0.85);
            const imgWidth = pageWidth - 30;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.setTextColor(30);
            pdf.setFontSize(22);
            pdf.text('Visualisations de Données', 15, 25);
            pdf.addImage(imgData, 'JPEG', 15, 35, imgWidth, imgHeight);
        }
        addFooter();
        if (options.includeTable) {
            pdf.addPage();
            currentPage++;
        }
    }

    // --- TABLEAU ---
    if (options.includeTable) {
        pdf.setTextColor(30);
        pdf.setFontSize(22);
        pdf.text('Annexes : Données Brutes', 15, 25);

        const rows = data.slice(0, 25); // Top 25 pour le PDF
        const cols = viz.numCols.slice(0, 6);

        let tableY = 40;
        pdf.setFontSize(9);
        pdf.setFillColor(240, 240, 240);
        pdf.rect(15, tableY - 5, pageWidth - 30, 8, 'F');

        cols.forEach((col: string, i: number) => pdf.text(col, 20 + (i * 30), tableY));

        tableY += 10;
        rows.forEach((row: any, i: number) => {
            cols.forEach((col: string, j: number) => {
                pdf.text(String(row[col] || '').slice(0, 15), 20 + (j * 30), tableY + (i * 8));
            });
        });

        addFooter();
    }

    pdf.save(`Rapport-DataGN-${title.replace(/\s+/g, '_')}.pdf`);
}
