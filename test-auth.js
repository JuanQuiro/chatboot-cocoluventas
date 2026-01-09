// Test auth endpoint
import fetch from 'node-fetch';

const testLogin = async () => {
    console.log('🧪 Testing auth endpoint...\n');

    try {
        const response = await fetch('http://localhost:3009/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@cocolu.com',
                password: 'admin123'
            })
        });

        const data = await response.json();

        console.log('📊 Response Status:', response.status);
        console.log('📦 Response Data:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('\n✅ Login successful!');
            console.log('🔑 Token:', data.token?.substring(0, 20) + '...');
        } else {
            console.log('\n❌ Login failed');
            console.log('Error:', data.error);
        }

    } catch (error) {
        console.error('❌ Request error:', error.message);
    }
};

testLogin();
