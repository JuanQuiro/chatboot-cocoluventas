import axios from 'axios';

async function debug() {
    try {
        console.log('Fetching http://localhost:3009/api/products ...');
        const res = await axios.get('http://localhost:3009/api/products');
        console.log('Status:', res.status);
        console.log('Headers:', res.headers['content-type']);
        console.log('Response Keys:', Object.keys(res.data));
        console.log('Response Data Type:', typeof res.data);

        if (res.data.data) {
            console.log('res.data.data Type:', typeof res.data.data);
            if (Array.isArray(res.data.data)) {
                console.log('res.data.data is Array. Length:', res.data.data.length);
                if (res.data.data.length > 0) console.log('First item:', res.data.data[0]);
            } else {
                console.log('res.data.data keys:', Object.keys(res.data.data));
            }
        }

        if (res.data.products) {
            console.log('res.data.products is Array. Length:', res.data.products.length);
        }

        console.log('FULL RESPONSE PREVIEW:', JSON.stringify(res.data, null, 2).substring(0, 500));

    } catch (e) {
        console.error('Error Message:', e.message);
        console.error('Error Code:', e.code);
        if (e.response) {
            console.log('Response Status:', e.response.status);
            console.log('Response Data:', JSON.stringify(e.response.data, null, 2));
        }
    }
}

debug();
