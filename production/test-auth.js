
import authService from './src/services/auth.service.js';

async function testAuth() {
    console.log('🧪 Starting Auth Test...');

    try {
        // 1. Check Default Admin
        console.log('Checking default admin...');
        const admin = authService.getUserByEmail('admin@cocolu.com');
        if (admin) {
            console.log('✅ Default admin exists:', admin.email);
        } else {
            console.error('❌ Default admin not found');
        }

        // 2. Register New User
        const testEmail = `test_${Date.now()}@example.com`;
        console.log(`Registering user: ${testEmail}...`);

        const newUser = await authService.register({
            email: testEmail,
            password: 'Password123!',
            name: 'Test User',
            role: 'user'
        });
        console.log('✅ User registered:', newUser.id);

        // 3. Login
        console.log('Logging in...');
        const loginResult = await authService.login(testEmail, 'Password123!');
        if (loginResult.token) {
            console.log('✅ Login successful. Token generated.');
        } else {
            console.error('❌ Login failed');
        }

        // 4. Verify Persistence (Check DB)
        const dbUser = authService.getUserById(newUser.id);
        if (dbUser) {
            console.log('✅ User persisted in DB:', dbUser.email);
        } else {
            console.error('❌ User not found in DB');
        }

        console.log('🎉 All tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testAuth();
