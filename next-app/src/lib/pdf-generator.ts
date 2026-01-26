import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Profile } from '@/types';
import { formatDate } from './utils';

export function generatePdfReport(profile: Profile) {
    const doc = new jsPDF();

    const history = [...profile.history].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // --- Title & Header ---
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // Emerald color
    doc.text('Raport Gorączki i Leków', 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Wygenerowano: ${formatDate(new Date())}`, 14, 28);

    // --- Patient Info ---
    doc.setDrawColor(200);
    doc.line(14, 32, 196, 32);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Pacjent: ${profile.name}`, 14, 42);
    doc.setFontSize(11);
    doc.text(`Waga: ${profile.weight} kg`, 14, 48);

    const historyCount = history.length;
    const maxTemp = history.reduce((max, h) => h.temperature ? Math.max(max, h.temperature) : max, 0);

    doc.text(`Liczba wpisów: ${historyCount}`, 80, 48);
    if (maxTemp > 0) {
        doc.text(`Najwyższa temp: ${maxTemp}°C`, 140, 48);
    }

    // --- Table Data Preparation ---
    const tableData = history.map(item => {
        const time = formatDate(new Date(item.timestamp), { dateStyle: 'short', timeStyle: 'short' });
        let type = '';
        let details = '';
        let notes = '';

        if (item.type === 'temp') {
            type = 'POMIAR';
            details = `${item.temperature}°C`;
        } else {
            type = item.drug.toUpperCase();
            details = `${item.doseMl}${item.unit} (${item.doseMg}mg)`;
            if (item.temperature) {
                notes = `Temp: ${item.temperature}°C`;
            }
        }

        return [time, type, details, notes];
    });

    // --- Generate Table ---
    autoTable(doc, {
        startY: 55,
        head: [['Data / Godzina', 'Rodzaj', 'Szczegóły', 'Notatki']],
        body: tableData,
        headStyles: { fillColor: [6, 78, 59] }, // Emerald-900 like
        alternateRowStyles: { fillColor: [240, 253, 244] }, // Emerald-50 like
        styles: { fontSize: 10 },
    });

    // --- Footer ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageCount = (doc.internal as any).getNumberOfPages() as number;

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Strona ${i} z ${pageCount} - Wygenerowano przez Kalkulator Gorączki`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
    }

    // Save
    doc.save(`raport-${profile.name}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
