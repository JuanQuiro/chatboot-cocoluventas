import reportsService from '../src/services/reports.service.js';

async function runReport() {
    console.log('📊 GENERATING DEEP FINANCIAL REPORT (Cocolu CFO Intelligence)...');

    // Default to current month
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const end = now.toISOString().slice(0, 10);

    console.log(`📅 Period: ${start} to ${end}\n`);

    // 1. P&L Statement
    const pnl = await reportsService.getPnL(start, end);

    console.log('--- 💰 PROFIT & LOSS STATEMENT ---');
    console.log(`💵 Revenue (Ventas):      $${pnl.revenue.toFixed(2)}`);
    console.log(`📦 COGS (Costo Venta):   -$${pnl.cogs.toFixed(2)}`);
    console.log(`-----------------------------------`);
    console.log(`📈 GROSS PROFIT:          $${pnl.grossProfit.toFixed(2)}`);
    console.log(`🤝 Commissions:          -$${pnl.commissions.toFixed(2)}`);
    console.log(`💡 Expenses (Gastos):    -$${pnl.expenses.toFixed(2)}`);
    console.log(`-----------------------------------`);
    console.log(`🏆 NET PROFIT (Neto):     $${pnl.netProfit.toFixed(2)}`);
    console.log(`📊 REAL MARGIN:           ${pnl.marginPercent}%`);
    console.log('\n');

    // 2. Product Performance
    console.log('--- 🏆 PRODUCT WINNERS & LOSERS ---');
    const products = await reportsService.getProductPerformance(start, end);

    // Top 3 Winners
    const winners = [...products].sort((a, b) => b.profit - a.profit).slice(0, 3);
    console.log('✅ TOP PROFIT (Winners):');
    winners.forEach(p => console.log(`   - ${p.name}: Profit $${p.profit.toFixed(2)} (Margin ${p.margin}%)`));

    // Top 3 Losers (Lowest Margin)
    const losers = [...products].sort((a, b) => a.margin - b.margin).slice(0, 3);
    console.log('\n⚠️ LOWEST MARGIN (Consider Commission Cap):');
    losers.forEach(p => console.log(`   - ${p.name}: Margin ${p.margin}% (Profit $${p.profit.toFixed(2)})`));

}

runReport();
