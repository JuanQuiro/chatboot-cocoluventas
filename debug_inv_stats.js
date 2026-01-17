import axios from 'axios';

async function debug() {
    try {
        console.log('Fetching http://localhost:3009/api/inventory/stats ...');
        const res = await axios.get('http://localhost:3009/api/inventory/stats');
        console.log('Status:', res.status);
        console.log('FULL RESPONSE:', JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error('Error Message:', e.message);
        if (e.response) {
            console.log('Response Status:', e.response.status);
            console.log('Response Data:', JSON.stringify(e.response.data, null, 2));
        }
    }
}

debug();
