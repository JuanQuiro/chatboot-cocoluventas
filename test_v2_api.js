
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3009/api';

async function testEndpoint(name, url) {
    try {
        console.log(`Testing ${name} (${url})...`);
        const res = await fetch(BASE_URL + url);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        console.log(`✅ ${name}: OK`);
        if (name === 'Dashboard') {
            const a = json.data.analytics;
            console.log(`   - Daily: ${a.daily?.total}`);
            console.log(`   - Weekly: ${a.weekly?.total}`);
            console.log(`   - Monthly: ${a.monthly?.total}`);
            console.log(`   - Production Load: ${json.data.production_workload?.length} manufacturers`);
        }
        if (name === 'Manufacturers') {
            console.log(`   - Count: ${json.data.length}`);
        }
        return true;
    } catch (e) {
        console.log(`❌ ${name}: FAILED - ${e.message}`);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting V2 API Verification...');

    // Give server a moment if it just restarted (manual restart might be needed)
    // Assuming server is running on 3009

    await testEndpoint('Dashboard', '/dashboard');
    await testEndpoint('Manufacturers', '/finance/manufacturers'); // Via finance router? No, let's check routes
    // Manufacturers was exposed in finance.routes.js but mounted at /api/finance
    // So url is /finance/manufacturers
    await testEndpoint('Finance Workload', '/finance/manufacturers');

    await testEndpoint('Income Summary', '/finance/income/summary');
    await testEndpoint('Expenses', '/finance/expenses');

    // Test Commission Config
    // await testEndpoint('Commission Config', '/finance/commissions/seller/1');

    console.log('✨ Verification Complete');
}

runTests();
