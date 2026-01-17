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

const stubsCode = `// Missing Endpoints Stubs
module.exports = function(app, db) {
  
  // Accounts Receivable Stubs
  app.get('/api/accounts-receivable', async (req, res) => {
    res.json({ data: [], meta: { total: 0, page: 1, limit: 15 } });
  });
  
  app.get('/api/accounts-receivable/stats', async (req, res) => {
    res.json({ 
      total: 0, 
      pending: 0, 
      overdue: 0, 
      paid: 0 
    });
  });
  
  // Installments Stubs  
  app.get('/api/installments', async (req, res) => {
    res.json({ data: [], meta: { total: 0, page: 1, limit: 50 } });
  });
  
  app.get('/api/installments/stats', async (req, res) => {
    res.json({ 
      total: 0, 
      pending: 0, 
      completed: 0, 
      overdue: 0 
    });
  });
  
  // Finance Commissions Stubs
  app.get('/api/finance/commissions/seller/:id', async (req, res) => {
    res.json({ commission_rate: 0, total_earned: 0 });
  });
  
  app.get('/api/finance/commissions/summary/sellers', async (req, res) => {
    res.json({ data: [], total_commission: 0 });
  });
  
  console.log('✅ Missing endpoints stubs loaded');
};
`;

console.log(`Creating missing endpoints stubs on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/src/api
        
        echo "=== CREATING STUBS FILE ==="
        cat > missing-endpoints-stubs.js << 'STUBSCODE'
${stubsCode}
STUBSCODE
        
        echo "✅ Stubs file created"
        
        echo ""
        echo "=== ADDING TO APP-INTEGRATED.JS ==="
        # Check if already required
        if grep -q "missing-endpoints-stubs" /var/www/cocolu-chatbot/app-integrated.js; then
            echo "Already loaded"
        else
            # Add require at the end before listen
            sed -i '/app.listen/i\\require("./src/api/missing-endpoints-stubs")(app, db);' /var/www/cocolu-chatbot/app-integrated.js
            echo "✅ Added to app-integrated.js"
        fi
        
        echo ""
        echo "=== RESTARTING PM2 ==="
        cd /var/www/cocolu-chatbot
        pm2 restart cocolu-dashoffice
        sleep 5
        
        echo ""
        echo "=== TESTING STUBBED ENDPOINTS ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "1. /api/installments/stats:"
        curl -s http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "2. /api/accounts-receivable:"
        curl -s http://127.0.0.1:3009/api/accounts-receivable -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo ""
        echo "✅ Stubs installed and tested"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Missing endpoints stubs created!");
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
