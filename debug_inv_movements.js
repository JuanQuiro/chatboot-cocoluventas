import axios from 'axios';

async function debug() {
    try {
        console.log('Fetching http://localhost:3009/api/inventory/movements ...');
        const res = await axios.get('http://localhost:3009/api/inventory/movements');
        console.log('Status:', res.status);
        console.log('RESPONSE DATA KEYS:', Object.keys(res.data));

        const movements = res.data.data;
        if (Array.isArray(movements) && movements.length > 0) {
            console.log('FIRST MOVEMENT:', JSON.stringify(movements[0], null, 2));
        } else {
            console.log('Movements:', movements);
        }
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) {
            console.log('Response status:', e.response.status);
            console.log('Response data:', e.response.data);
        }
    }
}

debug();
