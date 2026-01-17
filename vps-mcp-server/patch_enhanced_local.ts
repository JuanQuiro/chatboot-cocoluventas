import fs from 'fs';
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the raw file
let content = fs.readFileSync(join(__dirname, "enhanced_routes_local.js"), "utf8");

// Clean logs if present
const startIdx = content.indexOf('import');
if (startIdx > -1) content = content.substring(startIdx);

// Locate the route
const routeStart = content.indexOf("app.get('/api/sales/by-period',");
if (routeStart === -1) {
    console.error("❌ Could not find route definition");
    process.exit(1);
}

// Extract the relevant function block (naive matching)
// We'll just generate the NEW full logic and try to replace the old block assuming structure.
// Instead of complex replacement, let's inject a complete overwrite of the file with the fix
// since we have the full content in memory now.

// Logic to replace:
/*
    app.get('/api/sales/by-period', asyncHandler(async (req, res) => {
        // ... logic
    }));
*/

// We will find the start of the route and the end of its block (heuristic)
// Then insert our robust code.

const fixLogic = `app.get('/api/sales/by-period', asyncHandler(async (req, res) => {
    try {
        const { period } = req.query;
        let query = "SELECT * FROM sales WHERE 1=1";
        const params = [];

        // ROBUST SQLITE DATE LOGIC (Timezone Aware)
        // Using 'localtime' to match user perception if server is UTC relative to Venezuela
        if (period === 'daily') {
            // Get sales from 'start of day' in localtime
            query += " AND date(created_at, 'localtime') = date('now', 'localtime')";
        } else if (period === 'weekly') {
             // Start of week (Monday)
            query += " AND date(created_at, 'localtime') >= date('now', 'weekday 1', '-7 days', 'localtime')";
        } else if (period === 'monthly') {
             // Start of month
            query += " AND strftime('%Y-%m', created_at, 'localtime') = strftime('%Y-%m', 'now', 'localtime')";
        } else {
             // Default to daily if unknown
             query += " AND date(created_at, 'localtime') = date('now', 'localtime')";
        }

        query += " ORDER BY created_at DESC";

        const db = new Database(process.env.DB_PATH || '/var/www/cocolu-chatbot/data/cocolu.db', { readonly: true });
        const sales = db.prepare(query).all(...params);
        
        // Calculate totals
        const total = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        
        db.close();

        res.json({
            success: true,
            data: {
                period,
                total,
                count: sales.length,
                sales: sales.map(s => ({
                    ...s,
                    // Parse products if string
                    products: typeof s.products === 'string' ? JSON.parse(s.products || '[]') : s.products
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching sales by period:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}));`;

// Find where the old route starts
const oldRouteStart = content.indexOf("app.get('/api/sales/by-period'");
if (oldRouteStart > -1) {
    // Find matching closing brace/paren for the route definition
    let openBraces = 0;
    let openParens = 0;
    let endIndex = -1;
    let foundStart = false;

    for (let i = oldRouteStart; i < content.length; i++) {
        const char = content[i];
        if (char === '(') openParens++;
        if (char === ')') openParens--;
        if (char === '{') {
            openBraces++;
            foundStart = true;
        }
        if (char === '}') openBraces--;

        // End condition: We returned to 0 braces (after starting) AND 1 paren (the one closing app.get(...))
        // Or simpler: app.get( ... ) <-- semicolon usually follows
        if (foundStart && openBraces === 0 && openParens === 0 && content[i] === ';') {
            endIndex = i + 1;
            break;
        }
        // Backup heuristic: simple text search for next app.get or end of file
    }

    if (endIndex === -1) {
        // Fallback: search for next route or EOF
        const nextRoute = content.indexOf("app.", oldRouteStart + 10);
        if (nextRoute > -1) endIndex = nextRoute;
        else endIndex = content.lastIndexOf('});'); // End of setupEnhancedRoutes
    }

    if (endIndex > -1) {
        const newContent = content.substring(0, oldRouteStart) + fixLogic + content.substring(endIndex);
        fs.writeFileSync(join(__dirname, "enhanced-routes-patched.js"), newContent);
        console.log("✅ Patched logic in local file");
    } else {
        console.error("Could not find end of route block");
        process.exit(1);
    }
}
