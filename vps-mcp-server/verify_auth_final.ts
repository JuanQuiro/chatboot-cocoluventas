import axios from 'axios';

console.log("🕵️ TESTING AUTH FIX...");

async function testLogin() {
    try {
        // Test with EMAIL (should work)
        console.log("1. Testing Email Login...");
        const res = await axios.post('https://api.emberdrago.com/api/auth/login', {
            email: 'admin@cocolu.com',
            password: 'password123'
        });
        console.log(`✅ EMAIL LOGIN SUCCESS: Token ${res.data.token.substring(0, 10)}...`);

        // Test with USERNAME (should now work because it maps to 'name' or 'email' in query)
        // Note: The frontend sends 'username' field, which backend now maps to 'credential'.
        // If 'username' field is used by frontend, backend logic: const credential = email || username;
        // The query: WHERE email = ? OR name = ?
        // So if I send username: "Cocolu Admin", it should match 'name'.

        // Let's first check what the 'name' is in the users table.
        // Based on previous inspection, name was likely "Cocolu Admin" or similar if seeded correctly.
        // Or if I just send email again in 'username' field it should work too.

        console.log("2. Testing 'username' field payload...");
        const res2 = await axios.post('https://api.emberdrago.com/api/auth/login', {
            username: 'admin@cocolu.com', // Sending email in username field
            password: 'password123'
        });
        console.log(`✅ PAYLOAD MAPPING SUCCESS: Token ${res2.data.token.substring(0, 10)}...`);

    } catch (error) {
        console.error('❌ LOGIN FAILED:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

testLogin();
