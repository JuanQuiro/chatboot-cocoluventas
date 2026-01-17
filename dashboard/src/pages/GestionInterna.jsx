import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { financeService } from '../services/financeService';

export default function GestionInterna() {
    const [dateRange, setDateRange] = useState({
        // Default to Previous Month Start to ensure data from e.g. Dec 2025 shows up in Jan 2026
        start: new Date(new Date().setMonth(new Date().getMonth() - 1, 1)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    // Fetch Income Summary
    const { data: incomeData, isLoading: loadingIncome } = useQuery({
        queryKey: ['income-summary', dateRange],
        queryFn: () => financeService.getIncomeSummary(dateRange.start, dateRange.end)
    });

    // Fetch Expenses
    const { data: expensesData, isLoading: loadingExpenses } = useQuery({
        queryKey: ['expenses', dateRange],
        queryFn: () => financeService.getExpenses({ start: dateRange.start, end: dateRange.end })
    });

    const income = incomeData?.data || {};
    console.log('GestionInterna Debug:', { incomeData, income });
    const expenses = expensesData?.data || [];

    const totalIncome = (income.ingresos_pedidos || 0) + (income.ingresos_varios || 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.monto_total || 0), 0);
    const balance = totalIncome - totalExpenses;

    const chartData = [
        { name: 'Ingresos', value: totalIncome },
        { name: 'Egresos', value: totalExpenses },
        { name: 'Balance', value: balance }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión Interna</h1>
                    <p className="text-gray-500 mt-1">Resumen de Ingresos vs Egresos</p>
                </div>

                {/* Date Range Filter */}
                <div className="flex gap-3 items-center">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <span className="text-gray-500">hasta</span>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Income */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-600 text-sm font-medium">Total Ingresos</p>
                            <p className="text-3xl font-bold text-green-900 mt-2">
                                ${totalIncome.toFixed(2)}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                                Pedidos: ${(income.ingresos_pedidos || 0).toFixed(2)} | Varios: ${(income.ingresos_varios || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-green-500 p-3 rounded-full">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Total Expenses */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-600 text-sm font-medium">Total Egresos</p>
                            <p className="text-3xl font-bold text-red-900 mt-2">
                                ${totalExpenses.toFixed(2)}
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                                {expenses.length} gastos registrados
                            </p>
                        </div>
                        <div className="bg-red-500 p-3 rounded-full">
                            <TrendingDown className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Balance */}
                <div className={`bg-gradient-to-br ${balance >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'} rounded-xl p-6 border`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`${balance >= 0 ? 'text-blue-600' : 'text-orange-600'} text-sm font-medium`}>Balance Neto</p>
                            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-900' : 'text-orange-900'} mt-2`}>
                                ${balance.toFixed(2)}
                            </p>
                            <p className={`text-xs ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'} mt-1`}>
                                {balance >= 0 ? 'Superávit' : 'Déficit'}
                            </p>
                        </div>
                        <div className={`${balance >= 0 ? 'bg-blue-500' : 'bg-orange-500'} p-3 rounded-full`}>
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Comparación Visual</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Income Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Desglose de Ingresos</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-gray-700">Ingresos por Pedidos</span>
                            <span className="font-semibold text-green-700">${(income.ingresos_pedidos || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-gray-700">Ingresos Varios</span>
                            <span className="font-semibold text-green-700">${(income.ingresos_varios || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border-2 border-green-300">
                            <span className="font-semibold text-gray-900">Total</span>
                            <span className="font-bold text-green-900">${totalIncome.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Expenses Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Desglose de Egresos</h3>
                    <div className="space-y-3">
                        {expenses.slice(0, 5).map((expense, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                <span className="text-gray-700 truncate">{expense.descripcion || 'Sin descripción'}</span>
                                <span className="font-semibold text-red-700">${(expense.monto_total || 0).toFixed(2)}</span>
                            </div>
                        ))}
                        {expenses.length > 5 && (
                            <p className="text-sm text-gray-500 text-center">+ {expenses.length - 5} gastos más</p>
                        )}
                        <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg border-2 border-red-300">
                            <span className="font-semibold text-gray-900">Total</span>
                            <span className="font-bold text-red-900">${totalExpenses.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {loadingIncome || loadingExpenses ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : null}
        </div>
    );
}
