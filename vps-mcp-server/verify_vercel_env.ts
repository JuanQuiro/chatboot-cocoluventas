import axios from 'axios';
import dotenv from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = 'prj_5EhFkVc3l0dxfK60Z8KhkIYL23Gu';

async function checkVercelEnvs() {
    try {
        console.log('Fetching Vercel environment variables...\n');

        const response = await axios.get(
            `https://api.vercel.com/v9/projects/${PROJECT_ID}/env`,
            {
                headers: {
                    'Authorization': `Bearer ${VERCEL_TOKEN}`
                }
            }
        );

        const envs = response.data.envs;
        const apiUrl = envs.find((env: any) => env.key === 'REACT_APP_API_URL');

        console.log('Current REACT_APP_API_URL:');
        console.log(JSON.stringify(apiUrl, null, 2));

        if (apiUrl && apiUrl.value !== 'https://api.emberdrago.com/api') {
            console.log('\n⚠️  API URL is NOT correct!');
            console.log('Expected: https://api.emberdrago.com/api');
            console.log('Actual:', apiUrl.value);
        } else {
            console.log('\n✅ API URL is correct');
        }

    } catch (error: any) {
        console.error('Error:', error.response?.data || error.message);
    }
}

checkVercelEnvs();
