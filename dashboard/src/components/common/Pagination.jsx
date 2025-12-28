import React from 'react';
import './Pagination.css';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onLimitChange
}) => {
    if (totalItems === 0) return null;

    const startItem = ((currentPage - 1) * itemsPerPage) + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="pagination-container">
            <div className="pagination-info">
                Mostrando <strong>{startItem}-{endItem}</strong> de <strong>{totalItems}</strong>
            </div>

            <div className="pagination-controls">
                <div className="pagination-limits">
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        className="limit-select"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span className="limit-label">por página</span>
                </div>

                <div className="pagination-buttons">
                    <button
                        className="page-btn"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        title="Primera página"
                    >
                        <ChevronsLeft size={18} />
                    </button>
                    <button
                        className="page-btn"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        title="Anterior"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <span className="page-current">
                        Página {currentPage} de {totalPages}
                    </span>

                    <button
                        className="page-btn"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        title="Siguiente"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <button
                        className="page-btn"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        title="Última página"
                    >
                        <ChevronsRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
