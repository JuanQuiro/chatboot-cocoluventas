// useInstallmentSystem.js - COMPLETO con intereses, estados y edición
import { useState, useCallback, useEffect } from 'react';

export const useInstallmentSystem = (totalAmount) => {
  const [installmentConfig, setInstallmentConfig] = useState({
    enabled: false,
    initialPayment: 0,
    numberOfInstallments: 2,
    frequency: 'monthly', // 'weekly', 'biweekly', 'monthly'
    startDate: new Date().toISOString().split('T')[0],
    interestRate: 0, // ⭐ NUEVO: Tasa de interés mensual
    applyInterest: false // ⭐ NUEVO: Aplicar interés
  });

  const [creditType, setCreditType] = useState('programado'); // 'programado' | 'manual'

  const [installmentSchedule, setInstallmentSchedule] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]); // ⭐ NUEVO

  // Calcular fecha de vencimiento según frecuencia
  const calculateDueDate = useCallback((startDate, installmentNumber, frequency) => {
    const date = new Date(startDate);

    switch (frequency) {
      case 'weekly':
      case 'semanal':
        date.setDate(date.getDate() + (installmentNumber * 7));
        break;
      case 'biweekly':
      case 'quincenal':
        date.setDate(date.getDate() + (installmentNumber * 14));
        break;
      case 'monthly':
      case 'mensual':
      default:
        date.setMonth(date.getMonth() + installmentNumber);
        break;
    }

    return date.toISOString().split('T')[0];
  }, []);

  // ⭐ NUEVO: Calcular interés por cuota
  const calculateInterest = useCallback((amount, rate, installmentNumber) => {
    if (!installmentConfig.applyInterest || rate === 0) return 0;

    // Interés simple sobre el saldo pendiente
    const remainingInstallments = installmentConfig.numberOfInstallments - installmentNumber + 1;
    const interest = (amount * rate / 100) * remainingInstallments;

    return interest;
  }, [installmentConfig.applyInterest, installmentConfig.numberOfInstallments]);

  // ⭐ NUEVO: Determinar estado de la cuota
  const getInstallmentStatus = useCallback((dueDate, isPaid) => {
    if (isPaid) return 'paid';

    const today = new Date();
    const due = new Date(dueDate);

    if (due < today) return 'overdue';

    const daysUntilDue = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 7) return 'due_soon';

    return 'pending';
  }, []);

  const generateInstallmentSchedule = useCallback(() => {
    console.log('🔄 Generando calendario...', {
      enabled: installmentConfig.enabled,
      cuotas: installmentConfig.numberOfInstallments,
      total: totalAmount,
      inicial: installmentConfig.initialPayment
    });

    // Relaxed guard: If button is clicked, we assume intent to generate.
    // We only check for valid number of installments.
    if (installmentConfig.numberOfInstallments < 1) {
      console.warn('⚠️ Generación abortada: Cuotas inválidas (< 1)');
      setInstallmentSchedule([]);
      return;
    }

    const remainingAmount = totalAmount - installmentConfig.initialPayment;
    const baseAmount = remainingAmount / installmentConfig.numberOfInstallments;

    const schedule = [];

    for (let i = 1; i <= installmentConfig.numberOfInstallments; i++) {
      // ... (rest of logic same)
      const dueDate = calculateDueDate(
        installmentConfig.startDate,
        i,
        installmentConfig.frequency
      );

      // ⭐ NUEVO: Calcular interés
      const interest = calculateInterest(
        baseAmount,
        installmentConfig.interestRate,
        i
      );

      const installmentAmount = baseAmount + interest;

      schedule.push({
        number: i,
        amount: installmentAmount,
        baseAmount: baseAmount,
        interest: interest, // ⭐ NUEVO
        dueDate: dueDate,
        status: 'pending', // ⭐ NUEVO: pending, paid, overdue, due_soon
        isPaid: false, // ⭐ NUEVO
        paidAmount: 0, // ⭐ NUEVO
        paidDate: null, // ⭐ NUEVO
        notes: '' // ⭐ NUEVO
      });
    }

    console.log('✅ Calendario generado:', schedule);
    setInstallmentSchedule(schedule);
  }, [
    installmentConfig,
    totalAmount,
    calculateDueDate,
    calculateInterest
  ]);

  // ⭐ NUEVO: Actualizar cuota individual
  const updateInstallment = useCallback((installmentNumber, updates) => {
    setInstallmentSchedule(prev =>
      prev.map(inst =>
        inst.number === installmentNumber
          ? { ...inst, ...updates }
          : inst
      )
    );
  }, []);

  // ⭐ NUEVO: Registrar pago de cuota
  const recordPayment = useCallback((installmentNumber, amount, paymentDate = new Date().toISOString().split('T')[0]) => {
    setInstallmentSchedule(prev =>
      prev.map(inst => {
        if (inst.number === installmentNumber) {
          const newPaidAmount = inst.paidAmount + amount;
          const isPaid = newPaidAmount >= inst.amount;

          return {
            ...inst,
            paidAmount: newPaidAmount,
            isPaid: isPaid,
            paidDate: isPaid ? paymentDate : inst.paidDate,
            status: isPaid ? 'paid' : inst.status
          };
        }
        return inst;
      })
    );

    // Agregar al historial
    setPaymentHistory(prev => [...prev, {
      installmentNumber,
      amount,
      date: paymentDate,
      timestamp: new Date().toISOString()
    }]);
  }, []);

  // ⭐ NUEVO: Actualizar estados de cuotas
  useEffect(() => {
    if (installmentSchedule.length > 0) {
      setInstallmentSchedule(prev =>
        prev.map(inst => ({
          ...inst,
          status: getInstallmentStatus(inst.dueDate, inst.isPaid)
        }))
      );
    }
  }, [installmentSchedule.length, getInstallmentStatus]);

  const updateConfig = useCallback((updates) => {
    setInstallmentConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const enableInstallments = useCallback((initialPayment = 0) => {
    setInstallmentConfig(prev => ({
      ...prev,
      enabled: true,
      initialPayment
    }));
  }, []);

  const disableInstallments = useCallback(() => {
    setInstallmentConfig(prev => ({ ...prev, enabled: false }));
    setInstallmentSchedule([]);
    setPaymentHistory([]);
  }, []);

  // Calcular totales
  const getTotals = useCallback(() => {
    const totalInterest = installmentSchedule.reduce((sum, inst) => sum + inst.interest, 0);
    const totalBase = installmentSchedule.reduce((sum, inst) => sum + inst.baseAmount, 0);
    const totalPaid = installmentSchedule.reduce((sum, inst) => sum + inst.paidAmount, 0);
    const totalPending = installmentSchedule.reduce((sum, inst) =>
      inst.isPaid ? sum : sum + inst.amount, 0
    );

    return {
      totalInterest,
      totalBase,
      totalWithInterest: totalBase + totalInterest,
      totalPaid,
      totalPending,
      paidCount: installmentSchedule.filter(i => i.isPaid).length,
      pendingCount: installmentSchedule.filter(i => !i.isPaid).length,
      overdueCount: installmentSchedule.filter(i => i.status === 'overdue').length
    };
  }, [installmentSchedule]);

  return {
    installmentConfig,
    installmentSchedule,
    paymentHistory,
    updateConfig,
    enableInstallments,
    disableInstallments,
    generateInstallmentSchedule,
    updateInstallment,
    recordPayment,
    getTotals,
    creditType,
    setCreditType
  };
};

export default useInstallmentSystem;
