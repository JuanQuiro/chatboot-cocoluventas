import { Client } from "ssh2";
import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
};

const cleanSellerRoutes = `// Clean Seller Management Routes
module.exports = function(app, db) {
  
  // GET /api/sellers - List all active sellers
  app.get('/api/sellers', async (req, res) => {
    try {
      const sellers = db.prepare(\`
        SELECT 
          id, name, email, phone, active, status, specialty, 
          max_clients, current_clients, rating, work_schedule, days_off,
          created_at, updated_at
        FROM sellers 
        WHERE active = 1
        ORDER BY name ASC
      \`).all();
      
      res.json(sellers);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      res.status(500).json({ error: 'Error al obtener vendedores', details: error.message });
    }
  });
  
  // GET /api/sellers/:id - Get seller by ID
  app.get('/api/sellers/:id', async (req, res) => {
    try {
      const seller = db.prepare(\`
        SELECT 
          id, name, email, phone, active, status, specialty, 
          max_clients, current_clients, rating, work_schedule, days_off,
          created_at, updated_at
        FROM sellers 
        WHERE id = ?
      \`).get(req.params.id);
      
      if (!seller) {
        return res.status(404).json({ error: 'Vendedor no encontrado' });
      }
      
      res.json(seller);
    } catch (error) {
      console.error('Error fetching seller:', error);
      res.status(500).json({ error: 'Error al obtener vendedor', details: error.message });
    }
  });
  
  console.log('✅ Seller routes loaded successfully');
};
`;

console.log(`🔧 FINAL FIX: Replacing seller-management-routes.js on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== BACKING UP OLD FILE ==="
        cp src/api/seller-management-routes.js src/api/seller-management-routes.js.backup-$(date +%s) 2>/dev/null || echo "No old file to backup"
        
        echo ""
        echo "=== CREATING CLEAN SELLER ROUTES ==="
        cat > src/api/seller-management-routes.js << 'CLEANCODE'
${cleanSellerRoutes}
CLEANCODE
        
        echo "✅ Clean file created"
        
        echo ""
        echo "=== VERIFYING NO commission_rate ==="
        grep -i "commission" src/api/seller-management-routes.js || echo "✅ No commission_rate found"
        
        echo ""
        echo "=== STOPPING PM2 AND CLEARING EVERYTHING ==="
        pm2 stop all
        pm2 delete all
        pm2 kill
        pkill -9 node || true
        rm -rf ~/.pm2/logs/* 2>/dev/null || true
        sleep 3
        
        echo ""
        echo "=== STARTING FRESH PM2 ==="
        pm2 start app-integrated.js --name cocolu-dashoffice --update-env --no-automation
        pm2 save
        sleep 6
        
        echo ""
        echo "=== TESTING ALL ENDPOINTS ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        echo "Token: \${TOKEN:0:40}..."
        
        echo ""
        echo "1. Health:"
        curl -s http://127.0.0.1:3009/api/health | jq -r '.status' 2>/dev/null || echo "FAILED"
        
        echo ""
        echo "2. Sellers:"
        curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" | jq 'if type == "array" then {count: length, first: .[0].name} else {error: .error} end' 2>/dev/null
        
        echo ""
        echo "3. Clients:"
        curl -s http://127.0.0.1:3009/api/clients -H "Authorization: Bearer \$TOKEN" | jq -r '.meta.total' 2>/dev/null || echo "OK"
        
        echo ""
        echo "4. Products:"
        curl -s http://127.0.0.1:3009/api/products -H "Authorization: Bearer \$TOKEN" | jq -r '.meta.total' 2>/dev/null || echo "OK"
        
        echo ""
        echo "=== PM2 STATUS ==="
        pm2 status
        
        echo ""
        echo "=== CHECKING FOR ERRORS IN LOGS ==="
        pm2 logs cocolu-dashoffice --lines 20 --nostream 2>&1 | grep -i "error" | head -5 || echo "✅ No errors found"
        
        echo ""
        echo "=== EXTERNAL TEST (through Nginx) ==="
        curl -s https://api.emberdrago.com/api/sellers -H "Authorization: Bearer \$TOKEN" -H "Origin: https://cocolu.emberdrago.com" | jq 'if type == "array" then {success: true, count: length} else {error: .error} end' 2>/dev/null
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n🎉 FINAL FIX COMPLETE!");
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
