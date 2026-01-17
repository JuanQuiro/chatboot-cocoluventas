import React, { useState, useEffect } from 'react';
import './DataTable.css';

const DataTable = ({
    columns,
    data,
    loading = false,
    onRowClick,
    actions,
    pagination = true,
    pageSize = 10
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    // Ensure data is an array
    const safeData = Array.isArray(data) ? data : [];

    const totalPages = Math.ceil(safeData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Sort data
    const sortedData = React.useMemo(() => {
        if (!sortColumn) return safeData;

        return [...safeData].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [safeData, sortColumn, sortDirection]);

    const paginatedData = pagination
        ? sortedData.slice(startIndex, endIndex)
        : sortedData;

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    if (loading) {
        return (
            <div className="data-table-loading">
                <div className="spinner"></div>
                <p>Cargando datos...</p>
            </div>
        );
    }

    return (
        <div className="data-table-container">
            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                    className={column.sortable ? 'sortable' : ''}
                                >
                                    {column.label}
                                    {sortColumn === column.key && (
                                        <span className="sort-icon">
                                            {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                                        </span>
                                    )}
                                </th>
                            ))}
                            {actions && <th className="actions-column">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="no-data">
                                    No hay datos disponibles
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, index) => (
                                <tr
                                    key={row.id || index}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className={onRowClick ? 'clickable' : ''}
                                >
                                    {columns.map((column) => (
                                        <td key={column.key}>
                                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="actions-cell">
                                            {typeof actions === 'function' ? actions(row) : null}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && totalPages > 1 && (
                <div className="data-table-pagination">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                        title="Primera página"
                    >
                        «
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        ‹ Anterior
                    </button>

                    {/* Page Numbers */}
                    <div className="pagination-numbers">
                        {(() => {
                            const pages = [];
                            const maxVisible = 5;
                            let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                            let end = Math.min(totalPages, start + maxVisible - 1);

                            if (end - start + 1 < maxVisible) {
                                start = Math.max(1, end - maxVisible + 1);
                            }

                            if (start > 1) {
                                pages.push(
                                    <button key={1} onClick={() => setCurrentPage(1)} className="pagination-num">1</button>
                                );
                                if (start > 2) {
                                    pages.push(<span key="dots1" className="pagination-dots">...</span>);
                                }
                            }

                            for (let i = start; i <= end; i++) {
                                pages.push(
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i)}
                                        className={`pagination-num ${currentPage === i ? 'active' : ''}`}
                                    >
                                        {i}
                                    </button>
                                );
                            }

                            if (end < totalPages) {
                                if (end < totalPages - 1) {
                                    pages.push(<span key="dots2" className="pagination-dots">...</span>);
                                }
                                pages.push(
                                    <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className="pagination-num">{totalPages}</button>
                                );
                            }

                            return pages;
                        })()}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        Siguiente ›
                    </button>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                        title="Última página"
                    >
                        »
                    </button>

                    <span className="pagination-info">
                        ({startIndex + 1}-{Math.min(endIndex, safeData.length)} de {safeData.length})
                    </span>
                </div>
            )}
        </div>
    );
};

export default DataTable;
