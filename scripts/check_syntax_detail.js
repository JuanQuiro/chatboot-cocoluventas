import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const files = [
    'src/services/orders.service.js',
    'src/services/logistics.service.js',
    'src/repositories/order.repository.js',
    'src/repositories/variant.repository.js',
    'scripts/verify_master_flow.js'
];

async function check() {
    for (const file of files) {
        console.log(`\n📄 Checking ${file}...`);
        try {
            const content = fs.readFileSync(file, 'utf8');
            let open = 0;
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                for (const char of line) {
                    if (char === '{') open++;
                    if (char === '}') open--;
                }
            }
            console.log(`Bracket Balance: ${open}`);

            await import(path.resolve(file));
            console.log('✅ Import Successful');
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }
}

check();
