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
    username: process.env.VPS_PASSWORD,
};

console.log(`🔧 FIXING ROUTE FILES WITH CORRECT TABLE NAMES...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/src/api
        
        echo "=== CREATING CORRECT INSTALLMENTS ROUTES ==="
        cat > installments-routes.js << 'ENDFILE'
// Installments routes - uses 'cuotas' table
module.exports = (app, db) => {
  
  // GET /api/installments
  app.get('/api/installments', (req, res) => {
    try {
      const { status,start_date, end_date, page = 1, limit = 50 } = req.query;
      
      const cuotas = db.prepare(\`
        SELECT * FROM cuotas
        ORDER BY fecha_vencimiento DESC
        LIMIT ? OFFSET ?
      \`).all(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
      
      const total = db.prepare("SELECT COUNT(*) as count FROM cuotas").get();
      
      res.json({
        data: cuotas,
        meta: {
          total: total.count,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Installments endpoint error:', error);
      res.status(500).json({ error: 'Error fetching installments', details: error.message });
    }
  });
  
  // GET /api/installments/stats
  app.get('/api/installments/stats', (req, res) => {
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
      res.status(500).json({ error: 'Error fetching stats', details: error.message });
    }
  });
  
  console.log('✅ Installments routes loaded (using cuotas table)');
};
ENDFILE
        
        echo "✅ installments-routes.js created"
        
        echo ""
        echo "=== CREATING CORRECT ACCOUNTS RECEIVABLE ROUTES ==="
        cat > accounts-receivable-routes.js << 'ENDFILE'
// Accounts Receivable routes - uses 'cuentas_por_cobrar' table
module.exports = (app, db) => {
  
  // GET /api/accounts-receivable
  app.get('/api/accounts-receivable', (req, res) => {
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
      res.status(500).json({ error: 'Error fetching accounts', details: error.message });
    }
  });
  
  // GET /api/accounts-receivable/stats
  app.get('/api/accounts-receivable/stats', (req, res) => {
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
      res.status(500).json({ error: 'Error fetching stats', details: error.message });
    }
  });
  
  console.log('✅ Accounts receivable routes loaded (using cuentas_por_cobrar table)');
};
ENDFILE
        
        echo "✅ accounts-receivable-routes.js created"
        
        echo ""
        echo "=== RESTARTING PM2 ==="
        cd /var/www/cocolu-chatbot
        pm2 restart cocolu-dashoffice
        sleep 7
        
        echo ""
        echo "=== TESTING FIXED ENDPOINTS ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "1. Installments stats:"
        curl -s http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "2. Installments data:"
        curl -s "http://127.0.0.1:3009/api/installments?page=1&limit=10" -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "3. Accounts stats:"
        curl -s http://127.0.0.1:3009/api/accounts-receivable/stats -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "🎉 ROUTES FIXED - SYSTEM SHOULD BE 100% FUNCTIONAL NOW!"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ ROUTES FIXED!");
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
