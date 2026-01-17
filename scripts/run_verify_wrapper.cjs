const { spawn } = require('child_process');
const fs = require('fs');

const logStream = fs.createWriteStream('verify_crash.log');

const child = spawn('node', ['scripts/verify_master_flow.js'], {
    cwd: process.cwd(),
    shell: true
});

child.stdout.pipe(logStream);
child.stderr.pipe(logStream);

child.on('close', (code) => {
    console.log(`Child exited with code ${code}`);
    logStream.end();
});
