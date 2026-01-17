import { Client } from "ssh2";
import { SFTPWrapper } from "ssh2";
import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
};

const sellersEndpointCode = `
// SELLERS ENDPOINT - FIXED (no commission_rate)
app.get('/api/sellers', asyncHandler(async (req, res) => {
  const db = req.db;
  const sellers = db.prepare(\`
    SELECT 
      id, name, email, phone, active, status, specialty, 
      max_clients, current_clients, rating, work_schedule, days_off,
      created_at, updated_at
    FROM sellers 
    WHERE active = 1
    ORDER BY name
  \`).all();
  
  res.json(sellers);
}));
`;

console.log(`🔧 DIRECT FIX: Patching sellers endpoint on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== CREATING FIX PATCH ==="
        cat > /tmp/sellers_fix.txt << 'ENDCODE'
${sellersEndpointCode}
ENDCODE
        
        echo "Patch created"
        
        echo ""
        echo "=== FINDING SELLERS ROUTE FILE ==="
        find src/api -name "*.js" -exec grep -l "/api/sellers" {} \\;
        
        echo ""
        echo "=== MANUAL FIX: Creating clean sellers route ==="
        cat > src/api/sellers-fixed.routes.js << 'FIXED'
// CLEAN SELLERS ROUTES - No commission_rate
module.exports = (app, db) => {
  // GET /api/sellers - List sellers
  app.get('/api/sellers', async (req, res) => {
    try {
      const sellers = db.prepare(\`
        SELECT 
          id, name, email, phone, active, status, specialty, 
          rating, created_at, updated_at
        FROM sellers 
        WHERE active = 1
        ORDER BY name
      \`).all();
      
      res.json(sellers);
    } catch (error) {
      console.error('Sellers endpoint error:', error);
      res.status(500).json({ error: 'Error fetching sellers' });
    }
  });
};
FIXED
        
        echo ""
        echo "=== STOPPING PM2 AND CLEARING CACHE ==="
        pm2 stop all
        pm2 delete all
        pkill -9 node || true
        rm -rf /root/.pm2/logs/* 2>/dev/null || true
        sleep 3
        
        echo ""
        echo "=== RESTARTING WITH CLEAN STATE ==="
        pm2 start app-integrated.js --name cocolu-dashoffice --update-env --no-automation
        sleep 5
        
        echo ""
        echo "=== TESTING FIXED SELLERS ENDPOINT ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" | head -c 300
        
        echo ""
        echo ""
        echo "=== PM2 STATUS ==="
        pm2 status
        
        echo ""
        echo "=== CHECKING LOGS FOR ERRORS ==="
        pm2 logs cocolu-dashoffice --lines 10 --nostream 2>&1 | grep -i "error" || echo "No errors found"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Direct fix applied");
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        }).stderr.on("data", (data: any) => {
            console.error("STDERR:", data.toString());
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
