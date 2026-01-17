
import axios from 'axios';

async function testUsersApi() {
    try {
        console.log('🧪 Testing GET http://localhost:3009/api/users ...');
        // Usamos el token de admin si es necesario, pero este endpoint requiere auth.
        // Simulamos un login primero para obtener token

        console.log('🔐 Logging in as admin...');
        const login = await axios.post('http://localhost:3009/api/auth/login', {
            email: 'admin@cocolu.com',
            password: 'admin123'
        });

        const token = login.data.token;
        console.log('✅ Login success. Token obtained.');

        const response = await axios.get('http://localhost:3009/api/users', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('📦 API Response Status:', response.status);
        console.log('📄 API Response Data:', JSON.stringify(response.data, null, 2));

        if (response.data.users && response.data.users.length > 0) {
            console.log('✅ SUCCESS: Users found in API response');
        } else {
            console.error('❌ FAILURE: No users found in response');
        }

    } catch (error) {
        console.error('❌ Error during test:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testUsersApi();
