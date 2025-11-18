import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const DataTable = ({ 
    columns, 
    data,
    searchable = true,
    pagination = true,
    pageSize = 10,
    onRowClick
}) => {
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter
    const filteredData = searchTerm
        ? data.filter(row =>
            Object.values(row).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
        : data;

    // Sort
    const sortedData = sortColumn
        ? [...filteredData].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];
            const multiplier = sortDirection === 'asc' ? 1 : -1;
            return aVal > bVal ? multiplier : -multiplier;
        })
        : filteredData;

    // Paginate
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = pagination
        ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
        : sortedData;

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    return (
        <div className="space-y-4">
            {searchable && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                                >
                                    {column.sortable ? (
                                        <button
                                            onClick={() => handleSort(column.key)}
                                            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                                        >
                                            {column.header}
                                            {sortColumn === column.key ? (
                                                sortDirection === 'asc' ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                )
                                            ) : (
                                                <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                                            )}
                                        </button>
                                    ) : (
                                        column.header
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {paginatedData.map((row, idx) => (
                            <motion.tr
                                key={idx}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => onRowClick && onRowClick(row)}
                                className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                            >
                                {columns.map((column) => (
                                    <td key={column.key} className="px-6 py-4 text-sm text-gray-900">
                                        {column.render
                                            ? column.render(row[column.key], row)
                                            : row[column.key]}
                                    </td>
                                ))}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
                        {Math.min(currentPage * pageSize, sortedData.length)} de{' '}
                        {sortedData.length} resultados
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                        >
                            Anterior
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 rounded-lg ${
                                    page === currentPage
                                        ? 'bg-blue-600 text-white'
                                        : 'border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
