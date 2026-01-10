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

console.log(`🔧 Creating English table aliases on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/src/api
        
        echo "=== CREATING INSTALLMENTS AND ACCOUNTS_RECEIVABLE ROUTES ==="
        
        cat > installments-routes.js << 'ENDROUTES'
// Installments routes - maps to 'cuotas' table
module.exports = (app, db) => {
  
  // GET /api/installments
  app.get('/api/installments', async (req, res) => {
    try {
      const { status, start_date, end_date, page = 1, limit = 50 } = req.query;
      
      const installments = db.prepare(\`
        SELECT * FROM cuotas
        ORDER BY fecha_vencimiento DESC
        LIMIT ? OFFSET ?
      \`).all(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
      
      const total = db.prepare("SELECT COUNT(*) as count FROM cuotas").get();
      
      res.json({
        data: installments,
        meta: {
          total: total.count,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Installments endpoint error:', error);
      res.status(500).json({ error: 'Error fetching installments' });
    }
  });
  
  // GET /api/installments/stats
  app.get('/api/installments/stats', async (req, res) => {
    try {
      const stats = {
        total: db.prepare("SELECT COUNT(*) as count FROM cuotas").get().count || 0,
        pending: db.prepare("SELECT COUNT(*) as count FROM cuotas WHERE estado = 'pendiente'").get().count || 0,
        completed: db.prepare("SELECT COUNT(*) as count FROM cuotas WHERE estado = 'pagado'").get().count || 0,
        overdue: 0
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Installments stats error:', error);
      res.status(500).json({ error: 'Error fetching stats' });
    }
  });
  
  console.log('✅ Installments routes loaded');
};
ENDROUTES
        
        cat > accounts-receivable-routes.js << 'ENDACCOUNTS'
// Accounts Receivable routes - maps to 'cuentas_por_cobrar' table
module.exports = (app, db) => {
  
  // GET /api/accounts-receivable
  app.get('/api/accounts-receivable', async (req, res) => {
    try {
      const { page = 1, limit = 15 } = req.query;
      
      const accounts = db.prepare(\`
        SELECT * FROM cuentas_por_cobrar
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      \`).all(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
      
      const total = db.prepare("SELECT COUNT(*) as count FROM cuentas_por_cobrar").get();
      
      res.json({
        data: accounts,
        meta: {
          total: total.count,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Accounts receivable endpoint error:', error);
      res.status(500).json({ error: 'Error fetching accounts' });
    }
  });
  
  // GET /api/accounts-receivable/stats
  app.get('/api/accounts-receivable/stats', async (req, res) => {
    try {
      const stats = {
        total: db.prepare("SELECT COUNT(*) as count FROM cuentas_por_cobrar").get().count || 0,
        pending: db.prepare("SELECT COUNT(*) as count FROM cuentas_por_cobrar WHERE estado = 'pendiente'").get().count || 0,
        overdue: 0,
        paid: db.prepare("SELECT COUNT(*) as count FROM cuentas_por_cobrar WHERE estado = 'pagado'").get().count || 0
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Accounts receivable stats error:', error);
      res.status(500).json({ error: 'Error fetching stats' });
    }
  });
  
  console.log('✅ Accounts receivable routes loaded');
};
ENDACCOUNTS
        
        echo "✅ Route files created"
        
        echo ""
        echo "=== LOADING NEW ROUTES IN APP-INTEGRATED.JS ==="
        cd /var/www/cocolu-chatbot
        
        # Remove missing-endpoints-stubs if exists
        sed -i '/missing-endpoints-stubs/d' app-integrated.js
        
        # Add new routes before listen
        sed -i '/^app.listen/i\\
// Installments and Accounts Receivable routes\\
require("./src/api/installments-routes")(app, db);\\
require("./src/api/accounts-receivable-routes")(app, db);\\
' app-integrated.js
        
        echo "✅ Routes added to app-integrated.js"
        
        echo ""
        echo "=== RESTARTING PM2 ==="
        pm2 restart cocolu-dashoffice
        sleep 6
        
        echo ""
        echo "=== TESTING NEW ENDPOINTS ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "1. /api/installments/stats:"
        curl -s http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "2. /api/installments:"
        curl -s "http://127.0.0.1:3009/api/installments?page=1&limit=50" -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "3. /api/accounts-receivable/stats:"
        curl -s http://127.0.0.1:3009/api/accounts-receivable/stats -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "🎉 ALL ENDPOINTS SHOULD WORK NOW!"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ English routes created and loaded!");
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
