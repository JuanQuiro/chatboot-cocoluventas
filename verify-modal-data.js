
import axios from 'axios';

const API_URL = 'http://localhost:3009/api';

async function testEndpoint() {
    try {
        // 1. Login
        // console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@cocolu.com',
            password: 'admin123'
        });

        if (!loginRes.data.success) {
            throw new Error('Login failed');
        }

        const token = loginRes.data.token;
        // console.log('Login successful.');
        const headers = { Authorization: `Bearer ${token}` };

        // 2. Test
        console.log('\n--- TESTING DAILY MODAL ---');
        try {
            const dailyRes = await axios.get(`${API_URL}/sales/by-period?period=daily`, { headers });
            const sales = dailyRes.data.data.sales || [];
            console.log(`Daily: Found ${sales.length} sales. Total: $${dailyRes.data.data.total}`);
            if (sales.length > 0) console.log('✅ Daily Modal Fix VERIFIED');
            else console.log('❌ Daily Modal Empty');
        } catch (e) {
            console.error('Daily Request Failed:', e.response?.data || e.message);
        }

        console.log('\n--- TESTING MONTHLY MODAL ---');
        try {
            const monthlyRes = await axios.get(`${API_URL}/sales/by-period?period=monthly`, { headers });
            const sales = monthlyRes.data.data.sales || [];
            console.log(`Monthly: Found ${sales.length} sales. Total: $${monthlyRes.data.data.total}`);
            if (sales.length > 0) console.log('✅ Monthly Modal Fix VERIFIED');
        } catch (e) {
            console.error('Monthly Request Failed:', e.response?.data || e.message);
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

testEndpoint();
