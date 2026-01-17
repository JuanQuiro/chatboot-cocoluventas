const fs = require('fs');
const path = '/var/www/cocolu-chatbot/src/api/enhanced-routes.js';

try {
    console.log("Reading file...");
    let content = fs.readFileSync(path, 'utf8');

    const startMarker = "app.get('/api/sales/by-period', asyncHandler(async (req, res) => {";
    const endMarker = "}));"; // We will look for the specific one closing this block

    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) {
        throw new Error("Could not find start of /api/sales/by-period route");
    }

    // Find the next route definition to start header search limit
    const nextRouteIndex = content.indexOf("app.get('/api/sales',", startIndex);

    // Find the closing })); before the next route
    let endIndex = content.lastIndexOf(endMarker, nextRouteIndex);

    // Check if valid
    if (endIndex === -1 || endIndex < startIndex) {
        // Fallback: just find the first })); after start
        // This is risky if nested, but asyncHandler structure usually matches nicely
        // Let's count braces? No, too complex.
        // Let's assume the indentation or just find the first }));

        // Actually, if we look at the file, the next route is close.
        endIndex = content.indexOf("}));", startIndex);
    }

    if (endIndex === -1) {
        throw new Error("Could not find end of route block");
    }

    const newCode = `app.get('/api/sales/by-period', asyncHandler(async (req, res) => {
        const { period } = req.query;
        let filteredOrders = [];
        
        // Fetch all orders
        const orders = await ordersService.getAllOrders();
        const ordersArray = Array.isArray(orders) ? orders : [];

        // Helper for safe date
        const getSafeDate = (o) => {
            if (!o) return null;
            // Try different date fields
            const dStr = o.fecha_pedido || o.created_at || o.timestamp;
            if (!dStr) return null;
            const d = new Date(dStr);
            return isNaN(d.getTime()) ? null : d;
        };

        const now = new Date();

        if (period === 'daily') {
            // Compare YYYY-MM-DD
            // We use 'en-CA' for ISO-like format YYYY-MM-DD which is stable
            const todayStr = now.toLocaleDateString('en-CA'); 
            
            filteredOrders = ordersArray.filter(o => {
                const d = getSafeDate(o);
                if (!d) return false;
                return d.toLocaleDateString('en-CA') === todayStr;
            });
        } else if (period === 'weekly') {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
            startOfWeek.setHours(0,0,0,0);
            
            filteredOrders = ordersArray.filter(o => {
                const d = getSafeDate(o);
                if (!d) return false;
                return d >= startOfWeek;
            });
        } else if (period === 'monthly') {
             const thisMonth = now.getMonth();
             const thisYear = now.getFullYear();
             
             filteredOrders = ordersArray.filter(o => {
                const d = getSafeDate(o);
                if (!d) return false;
                return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
             });
        } else {
             // Default limit
             filteredOrders = ordersArray.slice(0, 50);
        }

        // Map to format expected by frontend
        const data = {
            sales: filteredOrders.map(o => ({
                id: o.id,
                total: parseFloat(o.total_usd || o.total || 0),
                clientName: o.cliente_nombre || 'Cliente',
                date: o.fecha_pedido || o.created_at,
                products: o.productos || []
            })),
            total: filteredOrders.reduce((acc, curr) => acc + (parseFloat(curr.total_usd || curr.total) || 0), 0)
        };

        res.json({ success: true, data });
    `;

    console.log("Replacing content...");
    const before = content.substring(0, startIndex);
    // +3 because })); length is 3. We want to KEEP })); or REPLACE it?
    // My newCode does NOT have })); at the end. 
    // Wait, I should include it in newCode or append it.
    // The original content has }));
    // My newCode above starts with app.get... and ends with res.json(...);
    // It is missing the closing brackets.

    // Correcting newCode to encapsulate fully
    const finalCode = newCode + `\n    }));`;

    const after = content.substring(endIndex + endMarker.length);

    const finalContent = before + finalCode + after;

    fs.writeFileSync(path, finalContent);
    console.log("✅ SUCCESS: File patched.");

} catch (e) {
    console.error("❌ ERROR:", e.message);
    process.exit(1);
}
