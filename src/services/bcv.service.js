import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'data', 'bcv_rate.json');

class BcvService {
    constructor() {
        this.rate = this.loadRate();
    }

    loadRate() {
        try {
            if (fs.existsSync(CACHE_FILE)) {
                const data = fs.readFileSync(CACHE_FILE, 'utf8');
                return data ? JSON.parse(data) : { dollar: 0, date: null, last_updated: null };
            }
        } catch (error) {
            console.error('⚠️ Could not load BCV rate cache:', error.message);
        }
        return { dollar: 0, date: null, last_updated: null };
    }

    saveRate(data) {
        try {
            const dir = path.dirname(CACHE_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
            this.rate = data;
        } catch (error) {
            console.error('⚠️ Could not save BCV rate cache:', error.message);
        }
    }

    async fetchCurrentRate() {
        try {
            console.log('🔄 Fetching BCV rate from API...');
            const response = await fetch('https://bcv-api.rafnixg.dev/rates/');
            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            // Data format expected: { "dollar": 270.7893, "date": "2025-12-15" }

            if (data && data.dollar) {
                const rateData = {
                    dollar: parseFloat(data.dollar),
                    date: data.date, // Date from BCV
                    last_updated: new Date().toISOString() // System timestamp
                };

                this.saveRate(rateData);
                console.log(`✅ BCV Rate Updated: ${rateData.dollar} (Date: ${rateData.date})`);
                return rateData;
            } else {
                console.warn('⚠️ Invalid data format received from BCV API:', data);
                return this.rate;
            }

        } catch (error) {
            console.error('❌ Error fetching BCV rate:', error.message);
            return this.rate;
        }
    }

    async fetchHistory() {
        try {
            console.log('🔄 Fetching BCV history from API...');
            const response = await fetch('https://bcv-api.rafnixg.dev/rates/history');
            if (!response.ok) {
                // Determine if 404 or other error to log appropriately
                console.warn(`⚠️ External API History endpoint returned ${response.status}`);
                return [];
            }
            const data = await response.json();
            // Expected data: Array of objects or object with history
            // We'll return it as is or parse if needed.
            // Assuming it returns an array of { date, dollar }
            return data;
        } catch (error) {
            console.error('❌ Error fetching BCV history:', error.message);
            return [];
        }
    }

    /**
     * Manually set the BCV rate (admin override)
     */
    setRate(newRate) {
        const rateData = {
            dollar: parseFloat(newRate),
            date: new Date().toISOString().split('T')[0],
            last_updated: new Date().toISOString(),
            manual: true
        };
        this.saveRate(rateData);
        console.log(`✅ BCV Rate Manually Set: ${rateData.dollar}`);
        return rateData;
    }

    getRate() {
        return this.rate;
    }
}

export default new BcvService();
