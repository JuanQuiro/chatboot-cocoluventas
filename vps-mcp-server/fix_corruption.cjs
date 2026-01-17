const fs = require('fs');
const filePath = '/var/www/cocolu-chatbot/app-integrated.js';

try {
    console.log('Reading file...');
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Fix the corrupted import line
    // The sed command likely left: "onfig';/a import bcvRoutes from './src/api/bcv.routes.js';"
    // We want: "import 'dotenv/config';\nimport bcvRoutes from './src/api/bcv.routes.js';"

    // We'll use a regex to be safe, looking for "onfig';/a"
    if (content.includes("onfig';/a")) {
        console.log('Found corrupted line, fixing...');
        content = content.replace(/.*onfig';\/a.*/, "import 'dotenv/config';\nimport bcvRoutes from './src/api/bcv.routes.js';");
    } else if (!content.includes("import bcvRoutes")) {
        console.log('Corrupted line not found by regex, checking for normal insertion...');
        // Maybe it's not corrupted but just didn't work?
        // But the previous cat showed it.
        // Let's try to add it if missing
        if (content.includes("import 'dotenv/config';")) {
            content = content.replace("import 'dotenv/config';", "import 'dotenv/config';\nimport bcvRoutes from './src/api/bcv.routes.js';");
        }
    }

    // 2. Add Route Mounting
    if (!content.includes("apiApp.use('/api/bcv'")) {
        console.log('Adding route mounting...');
        if (content.includes("const apiServer = apiApp.listen")) {
            content = content.replace("const apiServer = apiApp.listen", "apiApp.use('/api/bcv', bcvRoutes);\nconst apiServer = apiApp.listen");
        } else {
            console.error('❌ Could not find insertion point (apiApp.listen)');
        }
    }

    fs.writeFileSync(filePath, content);
    console.log('✅ File fixed and saved.');

} catch (e) {
    console.error('Error:', e);
}
