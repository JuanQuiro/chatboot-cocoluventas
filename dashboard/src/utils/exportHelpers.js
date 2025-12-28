/**
 * Export Utilities
 * Helper functions for exporting data in various formats
 */

/**
 * Export data to CSV format
 * @param {Array} headers - Column headers
 * @param {Array} rows - Data rows (array of arrays)
 * @param {string} filename - Output filename (without extension)
 */
export const exportToCSV = (headers, rows, filename) => {
    try {
        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, `${filename}.csv`);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        throw new Error('Error al exportar CSV');
    }
};

/**
 * Export data to JSON format
 * @param {Object|Array} data - Data to export
 * @param {string} filename - Output filename (without extension)
 */
export const exportToJSON = (data, filename) => {
    try {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        downloadBlob(blob, `${filename}.json`);
    } catch (error) {
        console.error('Error exporting JSON:', error);
        throw new Error('Error al exportar JSON');
    }
};

/**
 * Export data to Excel format (simple XLSX)
 * @param {Array} headers - Column headers
 * @param {Array} rows - Data rows
 * @param {string} filename - Output filename (without extension)
 */
export const exportToExcel = (headers, rows, filename) => {
    try {
        // Create simple HTML table for Excel
        const table = `
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
    `;

        const blob = new Blob([table], {
            type: 'application/vnd.ms-excel'
        });
        downloadBlob(blob, `${filename}.xls`);
    } catch (error) {
        console.error('Error exporting Excel:', error);
        throw new Error('Error al exportar Excel');
    }
};

/**
 * Export data to PDF format
 * Requires jsPDF library to be installed
 * @param {string} title - Document title
 * @param {Array} headers - Column headers
 * @param {Array} rows - Data rows
 * @param {string} filename - Output filename (without extension)
 */
export const exportToPDF = async (title, headers, rows, filename) => {
    try {
        // Dynamic import to avoid bundling if not needed
        const { jsPDF } = await import('jspdf');
        await import('jspdf-autotable');

        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.text(title, 14, 15);

        // Add table
        doc.autoTable({
            head: [headers],
            body: rows,
            startY: 25,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [99, 102, 241] }
        });

        // Add footer with date
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(
                `Página ${i} de ${pageCount} - ${new Date().toLocaleDateString()}`,
                14,
                doc.internal.pageSize.height - 10
            );
        }

        doc.save(`${filename}.pdf`);
    } catch (error) {
        console.error('Error exporting PDF:', error);
        throw new Error('Error al exportar PDF (instalar jsPDF)');
    }
};

/**
 * Helper function to trigger download
 * @param {Blob} blob - Data blob
 * @param {string} filename - Filename with extension
 */
const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Export component - Reusable export button with dropdown
 * @param {Object} props
 * @param {Function} props.onExport - Callback with format parameter
 * @param {Array} props.formats - Available formats ['csv', 'excel', 'pdf', 'json']
 */
export const ExportButton = ({ onExport, formats = ['csv', 'excel'] }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="export-dropdown">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="export-btn"
            >
                📥 Exportar
            </button>

            {isOpen && (
                <div className="export-menu">
                    {formats.includes('csv') && (
                        <button onClick={() => { onExport('csv'); setIsOpen(false); }}>
                            CSV
                        </button>
                    )}
                    {formats.includes('excel') && (
                        <button onClick={() => { onExport('excel'); setIsOpen(false); }}>
                            Excel
                        </button>
                    )}
                    {formats.includes('pdf') && (
                        <button onClick={() => { onExport('pdf'); setIsOpen(false); }}>
                            PDF
                        </button>
                    )}
                    {formats.includes('json') && (
                        <button onClick={() => { onExport('json'); setIsOpen(false); }}>
                            JSON
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default {
    exportToCSV,
    exportToJSON,
    exportToExcel,
    exportToPDF,
    ExportButton
};
