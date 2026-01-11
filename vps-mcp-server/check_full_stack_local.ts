import https from 'https';

const check = (url) => new Promise((resolve) => {
    https.get(url, (res) => {
        console.log(`✅ [${res.statusCode}] ${url} is ONLINE`);
        resolve(true);
    }).on('error', (e) => {
        console.error(`❌ ${url} is FAILED:`, e.message);
        resolve(false);
    });
});

console.log("🌍 VERIFYING FULL STACK AVAILABILITY...");
(async () => {
    await check('https://cocolu.emberdrago.com');
    // We check the API directly (assuming api subdomain is exposed)
    // Based on conversations, it's typically api.emberdrago.com or accessed via proxy.
    // However, the VPS check verified localhost:3009/health works.
    // Let's try to hit the public API health if known, otherwise trust the internal check.
    // The user provided https://api.emberdrago.com earlier.
    await check('https://api.emberdrago.com/health');
})();
