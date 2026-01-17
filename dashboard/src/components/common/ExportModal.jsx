import React, { useState } from 'react';
import Modal from './Modal';
import { FileSpreadsheet, FileJson, FileText, Download, Check, FileCode } from 'lucide-react';
import './ExportModal.css';

const ExportModal = ({ isOpen, onClose, onExport, entityName = 'Datos' }) => {
    const [selectedFormat, setSelectedFormat] = useState('excel');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await onExport(selectedFormat);
            onClose();
        } catch (error) {
            console.error('Export failed', error);
        } finally {
            setIsExporting(false);
        }
    };

    const formats = [
        {
            id: 'excel',
            label: 'Excel (.xlsx)',
            icon: FileSpreadsheet,
            description: 'Formato estándar para hojas de cálculo',
            color: '#10b981' // Green
        },
        {
            id: 'csv',
            label: 'CSV',
            icon: FileText,
            description: 'Valores separados por comas (Universal)',
            color: '#f59e0b' // Orange
        },
        {
            id: 'json',
            label: 'JSON',
            icon: FileJson,
            description: 'Formato de datos estructurados',
            color: '#6366f1' // Indigo
        },
        {
            id: 'pdf',
            label: 'PDF',
            icon: FileText,
            description: 'Documento listo para imprimir',
            color: '#ef4444' // Red
        },
        {
            id: 'markdown',
            label: 'Markdown (.md)',
            icon: FileCode,
            description: 'Texto enriquecido para documentación',
            color: '#1f2937' // Gray-800
        }
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Exportar ${entityName}`}
            size="small"
            footer={
                <div className="export-modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={isExporting}>
                        Cancelar
                    </button>
                    <button
                        className="btn-export"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <>
                                <span className="spinner-sm"></span> Exportando...
                            </>
                        ) : (
                            <>
                                <Download size={18} /> Exportar
                            </>
                        )}
                    </button>
                </div>
            }
        >
            <div className="export-options-grid">
                {formats.map((format) => {
                    const Icon = format.icon;
                    const isSelected = selectedFormat === format.id;

                    return (
                        <div
                            key={format.id}
                            className={`export-option-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => setSelectedFormat(format.id)}
                            style={{ '--accent-color': format.color }}
                        >
                            <div className="export-icon-wrapper">
                                <Icon size={24} />
                            </div>
                            <div className="export-info">
                                <span className="export-label">{format.label}</span>
                                <span className="export-desc">{format.description}</span>
                            </div>
                            {isSelected && (
                                <div className="export-check">
                                    <Check size={16} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </Modal>
    );
};

export default ExportModal;
