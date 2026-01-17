import React, { useState } from 'react';
import { FileDown, FileSpreadsheet, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * ExportButton - Universal export component for reports
 * @param {Object} props
 * @param {Array} props.data - Data to export
 * @param {Array} props.columns - Column definitions [{ key, label, exportValue }]
 * @param {String} props.filename - Base filename without extension
 * @param {Array} props.formats - Export formats ['pdf', 'excel', 'csv']
 * @param {String} props.title - Report title for PDF
 */
export default function ExportButton({
    data = [],
    columns = [],
    filename = 'reporte',
    formats = ['pdf', 'excel', 'csv'],
    title = 'Reporte'
}) {
    const [showMenu, setShowMenu] = useState(false);
    const [exporting, setExporting] = useState(false);

    const getRowValue = (row, col) => {
        if (col.exportValue && typeof col.exportValue === 'function') {
            return col.exportValue(row);
        }
        const value = typeof col.key === 'function' ? col.key(row) : row[col.key];
        return value !== undefined && value !== null ? value : '';
    };

    const formatData = () => {
        return data.map(row => {
            const formatted = {};
            columns.forEach(col => {
                formatted[col.label] = getRowValue(row, col);
            });
            return formatted;
        });
    };

    const exportToPDF = () => {
        try {
            setExporting(true);
            const doc = new jsPDF();

            // Title
            doc.setFontSize(18);
            doc.text(title, 14, 22);

            // Date
            doc.setFontSize(11);
            doc.text(`Fecha: ${new Date().toLocaleDateString('es-VE')}`, 14, 32);

            // Table
            const tableData = data.map(row =>
                columns.map(col => String(getRowValue(row, col)))
            );

            doc.autoTable({
                head: [columns.map(col => col.label)],
                body: tableData,
                startY: 40,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [79, 70, 229] },
                margin: { top: 40 }
            });

            doc.save(`${filename}.pdf`);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Error al exportar PDF');
        } finally {
            setExporting(false);
            setShowMenu(false);
        }
    };

    const exportToExcel = () => {
        try {
            setExporting(true);
            const formattedData = formatData();

            const worksheet = XLSX.utils.json_to_sheet(formattedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');

            // Auto-size columns
            const maxWidth = 50;
            const cols = columns.map(col => ({ wch: Math.min(col.label.length + 5, maxWidth) }));
            worksheet['!cols'] = cols;

            XLSX.writeFile(workbook, `${filename}.xlsx`);
        } catch (error) {
            console.error('Error exporting Excel:', error);
            alert('Error al exportar Excel');
        } finally {
            setExporting(false);
            setShowMenu(false);
        }
    };

    const exportToCSV = () => {
        try {
            setExporting(true);
            const formattedData = formatData();

            const csv = Papa.unparse(formattedData, {
                quotes: true,
                delimiter: ',',
                header: true
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Error al exportar CSV');
        } finally {
            setExporting(false);
            setShowMenu(false);
        }
    };

    const handleExport = (format) => {
        switch (format) {
            case 'pdf':
                exportToPDF();
                break;
            case 'excel':
                exportToExcel();
                break;
            case 'csv':
                exportToCSV();
                break;
            default:
                console.error('Invalid format');
        }
    };

    if (!data || data.length === 0) {
        return (
            <button
                className="export-btn disabled"
                disabled
                title="No hay datos para exportar"
            >
                <FileDown size={18} />
                Exportar
            </button>
        );
    }

    return (
        <div className="export-button-container" style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="export-btn"
                disabled={exporting}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: exporting ? 'wait' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                }}
            >
                <FileDown size={18} />
                {exporting ? 'Exportando...' : 'Exportar'}
            </button>

            {showMenu && !exporting && (
                <div
                    className="export-menu"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '8px',
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                        minWidth: '150px',
                        overflow: 'hidden'
                    }}
                >
                    {formats.includes('pdf') && (
                        <button
                            onClick={() => handleExport('pdf')}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: 'none',
                                background: 'transparent',
                                textAlign: 'left',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '14px',
                                color: '#374151',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                            <FileText size={18} color="#ef4444" />
                            PDF
                        </button>
                    )}
                    {formats.includes('excel') && (
                        <button
                            onClick={() => handleExport('excel')}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: 'none',
                                background: 'transparent',
                                textAlign: 'left',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '14px',
                                color: '#374151',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                            <FileSpreadsheet size={18} color="#10b981" />
                            Excel
                        </button>
                    )}
                    {formats.includes('csv') && (
                        <button
                            onClick={() => handleExport('csv')}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: 'none',
                                background: 'transparent',
                                textAlign: 'left',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '14px',
                                color: '#374151',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                            <FileText size={18} color="#3b82f6" />
                            CSV
                        </button>
                    )}
                </div>
            )}

            {/* Close menu when clicking outside */}
            {showMenu && (
                <div
                    onClick={() => setShowMenu(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999
                    }}
                />
            )}
        </div>
    );
}
