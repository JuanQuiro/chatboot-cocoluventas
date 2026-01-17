import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default to baileys if not specified
const adapter = process.env.BOT_ADAPTER || 'baileys';

console.log(`🚀 STARTING PRODUCTION SERVER`);
console.log(`ℹ️  Adapter: ${adapter}`);
console.log(`ℹ️  Mode: NON-INTERACTIVE`);

const child = spawn('node', ['app-integrated.js'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        BOT_ADAPTER: adapter,
        NODE_ENV: 'production'
    },
    cwd: __dirname,
});

child.on('error', (error) => {
    console.error('❌ Failed to start bot process:', error);
    process.exit(1);
});

child.on('exit', (code) => {
    if (code !== 0) {
        console.error(`❌ Bot process exited with code ${code}`);
    }
    process.exit(code);
});

// Handle termination signals
process.on('SIGINT', () => {
    console.log('🛑 Stopping bot...');
    child.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('🛑 Stopping bot...');
    child.kill('SIGTERM');
});
