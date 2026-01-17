import { Client } from "ssh2";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
    readyTimeout: 90000,
};

console.log("🔧 PATCHING SALES LOGIC...");

const conn = new Client();
conn.on("ready", () => {
    // We will use a node script on the VPS to do the replacement reliably
    const fixScript = `
const fs = require('fs');
const path = '/var/www/cocolu-chatbot/src/api/enhanced-routes.js';

try {
    let content = fs.readFileSync(path, 'utf8');

    // Define the new robust handler code
    // usage: app.get('/api/sales/by-period', asyncHandler(async (req, res) => { ... }));
    
    const newHandlerBody = \`
        const { period } = req.query;
        let filteredOrders = [];
        
        // Fetch all orders
        const orders = await ordersService.getAllOrders();
        const ordersArray = Array.isArray(orders) ? orders : [];

        // Helper for safe date
        const getSafeDate = (o) => {
            if (!o) return null;
            const d = new Date(o.fecha_pedido || o.created_at || o.timestamp);
            return isNaN(d.getTime()) ? null : d;
        };

        const now = new Date();

        if (period === 'daily') {
            const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD local server time
            filteredOrders = ordersArray.filter(o => {
                const d = getSafeDate(o);
                if (!d) return false;
                // Compare YYYY-MM-DD string
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
            // Default: All or limited? Let's return last 50
             filteredOrders = ordersArray.slice(0, 50);
        }

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
\`;

    // Regex to match the route handler body
    // Matches: app.get('/api/sales/by-period', asyncHandler(async (req, res) => { ... }));
    // We replace the content inside the arrow function
    
    // Pattern: 
    // app.get('/api/sales/by-period', asyncHandler(async (req, res) => {
    //    [... capture everything until ...]
    // }));
    
    // Since regex across multiple lines is tricky in JS without s flag (ES2018), we use a simpler string replacement if strictly matching or split logic.
    // But the file content is somewhat variable.
    
    // Let's use string indexOf to find the start and end of the block.
    const startStr = "app.get('/api/sales/by-period', asyncHandler(async (req, res) => {";
    const startIndex = content.indexOf(startStr);
    
    if (startIndex === -1) {
        console.error("❌ Could not find route definition start");
        process.exit(1);
    }

    // Find the matching closing block. 
    // Since we know the next route starts with `app.get('/api/sales', ` or `app.get('...`, we can search for the next route definition or just search for the logic we saw "res.json"

    // Better strategy: We know the previous code had "switch (period)". We can replace from "const { period } = req.query;" down to occurrences.
    
    const bodyStart = content.indexOf("const { period } = req.query;", startIndex);
    if (bodyStart === -1) {
        console.error("❌ Could not find body start");
        process.exit(1);
    }

    // Find the end of this handler. 
    // The previous listing showed it ends with "}));" before "app.get('/api/sales',".
    const nextRoute = content.indexOf("app.get('/api/sales',", bodyStart);
    let endIndex = -1;

    if (nextRoute !== -1) {
        endIndex = content.lastIndexOf("}));", nextRoute);
    } else {
        // Just find the next }));
        endIndex = content.indexOf("}));", bodyStart);
    }

    if (endIndex === -1) {
        console.error("❌ Could not find body end");
        process.exit(1);
    }

    // Perform replacement
    const pre = content.substring(0, bodyStart);
    const post = content.substring(endIndex); // Keep the })); and beyond? No, newHandlerBody doesn't have it.

    // newHandlerBody does NOT have "}));". So we keep the post from "}));" ? 
    // Wait, the "post" should start AT the end of my matched block.
    // If I replace strictly the body, I should keep the wrapper.

    // My newHandlerBody ends with "res.json({ success: true, data });".
    // The original ended with "res.json({ success: true, data: { ... } });".

    const newContent = pre + newHandlerBody + "    " + post;

    fs.writeFileSync(path, newContent);
    console.log("✅ File patched successfully.");

} catch (e) {
    console.error("Error:", e);
}
`;

    const base64Script = Buffer.from(fixScript).toString('base64');
    
    conn.exec(`echo "${base64Script}" | base64 - d > /var/www / cocolu - chatbot / patch_sales.js && node /var/www/cocolu - chatbot / patch_sales.js && rm /var/www/cocolu - chatbot / patch_sales.js`, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error(d.toString()));
        stream.on('close', () => {
             console.log("🔄 Restarting PM2...");
             conn.exec("pm2 restart cocolu-dashoffice", (err, stream2) => {
                 stream2.on('data', d => console.log(d.toString()));
                 stream2.on('close', () => conn.end());
             });
        });
    });
}).connect(config);
