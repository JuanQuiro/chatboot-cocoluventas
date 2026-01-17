
import axios from 'axios';

async function test() {
    try {
        console.log('Testing /api/finance/income/summary...');
        // Try without auth first (it seems unprotected in route file)
        const res = await axios.get('http://localhost:3009/api/finance/income/summary');
        console.log('Status:', res.status);
        console.log('Data:', JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) {
            console.error('Response Status:', e.response.status);
            console.error('Response Data:', e.response.data);
        }
    }
}

test();
