// useClientValidation.js - Hook para validaciones completas de cliente
import { useState, useCallback } from 'react';
import { clientsService } from '../services/clientsService';

export const useClientValidation = () => {
    const [validationState, setValidationState] = useState({
        isValid: true,
        errors: [],
        warnings: [],
        clientData: null
    });

    const validateClient = useCallback(async (clientId, saleAmount = 0) => {
        try {
            // Obtener datos del cliente incluyendo deuda y límite de crédito
            const clientData = await clientsService.getClientById(clientId);
            const debtSummary = await clientsService.getClientDebtSummary(clientId);

            const errors = [];
            const warnings = [];

            // 1. Validar si el cliente está activo
            if (clientData.status === 'inactive') {
                errors.push({
                    type: 'CLIENT_INACTIVE',
                    message: 'Este cliente está inactivo. No se pueden realizar ventas.',
                    severity: 'error'
                });
            }

            // 2. Validar límite de crédito
            if (clientData.creditLimit && debtSummary.totalDebt) {
                const availableCredit = clientData.creditLimit - debtSummary.totalDebt;

                if (saleAmount > availableCredit) {
                    errors.push({
                        type: 'CREDIT_LIMIT_EXCEEDED',
                        message: `El monto de la venta ($${saleAmount.toFixed(2)}) excede el crédito disponible ($${availableCredit.toFixed(2)})`,
                        severity: 'error',
                        data: {
                            saleAmount,
                            availableCredit,
                            creditLimit: clientData.creditLimit,
                            currentDebt: debtSummary.totalDebt
                        }
                    });
                } else if (saleAmount > availableCredit * 0.8) {
                    warnings.push({
                        type: 'CREDIT_LIMIT_WARNING',
                        message: `Esta venta utilizará el ${((saleAmount / availableCredit) * 100).toFixed(0)}% del crédito disponible`,
                        severity: 'warning'
                    });
                }
            }

            // 3. Validar deudas vencidas
            if (debtSummary.overdueDebt > 0) {
                warnings.push({
                    type: 'OVERDUE_DEBT',
                    message: `El cliente tiene deudas vencidas por $${debtSummary.overdueDebt.toFixed(2)}`,
                    severity: 'warning',
                    data: {
                        overdueDebt: debtSummary.overdueDebt,
                        overdueCount: debtSummary.overdueCount
                    }
                });
            }

            // 4. Validar historial de pagos
            if (debtSummary.latePaymentCount > 3) {
                warnings.push({
                    type: 'LATE_PAYMENT_HISTORY',
                    message: `El cliente tiene ${debtSummary.latePaymentCount} pagos atrasados en su historial`,
                    severity: 'warning'
                });
            }

            // 5. Validar bloqueo por deuda
            if (clientData.blockedForDebt) {
                errors.push({
                    type: 'CLIENT_BLOCKED',
                    message: 'Cliente bloqueado por deudas. Contacte al administrador.',
                    severity: 'error'
                });
            }

            setValidationState({
                isValid: errors.length === 0,
                errors,
                warnings,
                clientData: {
                    ...clientData,
                    debtSummary
                }
            });

            return {
                isValid: errors.length === 0,
                errors,
                warnings
            };

        } catch (error) {
            console.error('Error validating client:', error);
            setValidationState({
                isValid: false,
                errors: [{
                    type: 'VALIDATION_ERROR',
                    message: 'Error al validar cliente. Intente nuevamente.',
                    severity: 'error'
                }],
                warnings: [],
                clientData: null
            });

            return {
                isValid: false,
                errors: [{
                    type: 'VALIDATION_ERROR',
                    message: 'Error al validar cliente',
                    severity: 'error'
                }],
                warnings: []
            };
        }
    }, []);

    const clearValidation = useCallback(() => {
        setValidationState({
            isValid: true,
            errors: [],
            warnings: [],
            clientData: null
        });
    }, []);

    return {
        validationState,
        validateClient,
        clearValidation
    };
};

export default useClientValidation;
