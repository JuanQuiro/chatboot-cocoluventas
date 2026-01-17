import { Router } from 'express';
import paymentsService from '../services/payments.service.js';
import clientsService from '../services/clients.service.js';
import ordersService from '../services/orders.service.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = Router();

console.log("💰 Loading Financial Routes Module...");

// ============================================
// FINANZAS (Income, Debts, Accounts Receivable)
// ============================================

// GET /api/income - Listado de Ingresos (Abonos)
// GET /api/income/stats - Estadísticas de Ingresos
router.get('/income/stats', asyncHandler(async (req, res) => {
    console.log("💰 /income/stats GET request");
    const stats = await paymentsService.getGlobalIncomeStats(req.query);
    res.json({ success: true, data: stats });
}));

// GET /api/income - Listado de Ingresos (Abonos + Variados)
router.get('/income', asyncHandler(async (req, res) => {
    console.log("💰 /income GET request with pagination");
    const { page, limit } = req.query;
    // getAllIncome now accepts options and returns { success: true, data: ..., meta: ... }
    const response = await paymentsService.getAllIncome({ page, limit });
    res.json(response);
}));

// POST /api/income - Registrar Nuevo Ingreso (Varios)
router.post('/income', asyncHandler(async (req, res) => {
    console.log("💰 /income POST request", req.body);
    const result = await paymentsService.createIncome(req.body);
    res.json({ success: true, data: result });
}));

// GET /api/debts - Deudas (Acreedores / Salidas)
// Como en este sistema parece orientarse a ventas, "debts" podrían ser 
// gastos o compras, pero si no hay módulo de gastos, devolveremos array vacío 
// para evitar el 404.
router.get('/debts', asyncHandler(async (req, res) => {
    // We redirect to using the financeService.getExpenses internally
    // but formatted for the frontend expectation if needed. 
    // The frontend DataTable expects array of objects in `data`.

    // Import financeService dynamically if not available in current scope or use the one from imports
    // Since we are in the same file `financial.routes.js`, and `finance.service.js` is not imported here...
    // We should import it.

    // Instead of importing, let's use paymentsService if it has it, OR better:
    // Update the frontend to point to `/api/finance/expenses`. But updating frontend build is slower.
    // Let's proxy:
    const financeService = (await import('../services/finance.service.js')).default;
    const expenses = financeService.getExpenses(req.query);

    // Map expenses to matching format if needed, or just return them
    // Expenses columns: id, descripcion, provider, amount_usd, state, etc.
    // Frontend expects: clientName (provider), amount, status

    const mapped = expenses.map(e => ({
        id: e.id,
        provider: e.proveedor,
        amount: e.monto_total_usd,
        status: e.estado,
        dueDate: e.fecha_limite,
        description: e.descripcion,
        category: e.categoria
    }));

    res.json({ success: true, data: mapped });
}));

// GET /api/accounts-receivable - Cuentas por Cobrar (Clientes que deben)
router.get('/accounts-receivable', asyncHandler(async (req, res) => {
    const { search, page, limit } = req.query;
    // Service now manages filtering in SQL via getPending
    const response = paymentsService.getPendingPayments(search, { page, limit });
    res.json(response);
}));

// GET /api/accounts-receivable/stats - Stats de Cuentas por Cobrar
router.get('/accounts-receivable/stats', asyncHandler(async (req, res) => {
    const stats = paymentsService.getStats();
    res.json({ success: true, data: stats });
}));

// GET /api/financial/stats - Resumen financiero
router.get('/financial/stats', asyncHandler(async (req, res) => {
    const stats = paymentsService.getStats();
    res.json({ success: true, data: stats });
}));

// ============================================
// CLIENTES QUICK
// ============================================

// GET /api/clients/quick - Lista rápida de clientes (ID y Nombre)
router.get('/clients/quick', asyncHandler(async (req, res) => {
    const search = req.query.search || '';
    // Usamos el servicio existente with NO LIMIT for dropdowns
    // Both return { success: true, data: [...], meta }
    const response = search
        ? clientsService.searchClients(search, { limit: -1 })
        : clientsService.getAllClients({ limit: -1 });

    const clients = response.data || [];

    // Mapeamos a estructura ligera
    const quickList = clients.map(c => ({
        id: c.id,
        name: `${c.nombre} ${c.apellido}`,
        phone: c.telefono
    }));

    res.json({ success: true, data: quickList });
}));

export default router;
