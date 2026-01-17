import fs from 'fs';
import path from 'path';

// Fix path to be absolute based on process.cwd()
const CACHE_FILE = path.join(process.cwd(), 'data', 'bcv_rate.json');

class BcvService {
    constructor() {
        this.rate = this.loadRate();
        // Auto-sync on startup
        this.fetchCurrentRate().catch(err => console.error('Startup sync failed:', err.message));
    }

    loadRate() {
        try {
            if (fs.existsSync(CACHE_FILE)) {
                const data = fs.readFileSync(CACHE_FILE, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading stored rate:', error.message);
        }
        return { dollar: 0, date: null, last_updated: null };
    }

    saveRate(rateData) {
        try {
            const dir = path.dirname(CACHE_FILE);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            fs.writeFileSync(CACHE_FILE, JSON.stringify(rateData, null, 2));
            this.rate = rateData; // IMPORTANT: Update the in-memory rate
            console.log('✅ Rate saved to cache:', rateData.dollar);
        } catch (error) {
            console.error('Error saving rate:', error.message);
        }
    }

    async fetchCurrentRate() {
        try {
            console.log('🔄 Fetching current BCV rate from API...');
            // Using logic that tries multiple sources or a reliable one
            // Try pydolarvenezuela first
            try {
                const response = await fetch('https://pydolarvenezuela-api.vercel.app/api/v1/dollar/page?page=bcv');
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.monitors && data.monitors.usd) {
                        const price = data.monitors.usd.price || 0;
                        const date = data.monitors.usd.last_update || new Date().toISOString().split('T')[0];

                        if (price > 0) {
                            const rateData = {
                                dollar: parseFloat(price),
                                date: date,
                                last_updated: new Date().toISOString(),
                                source: 'pydolarvenezuela',
                                manual: false
                            };
                            this.saveRate(rateData);
                            return rateData;
                        }
                    }
                }
            } catch (e) {
                console.warn('Primary API failed, trying backup...');
            }

            // Backup API
            const response = await fetch('https://bcv-api.rafnixg.dev/rates/usd');
            if (response.ok) {
                const data2 = await response.json();
                const price = data2.price || data2.rate || 0;
                if (price > 0) {
                    const rateData = {
                        dollar: parseFloat(price),
                        date: new Date().toISOString().split('T')[0],
                        last_updated: new Date().toISOString(),
                        source: 'rafnixg',
                        manual: false
                    };
                    this.saveRate(rateData);
                    return rateData;
                }
            }

            return this.rate;
        } catch (error) {
            console.error('❌ Error fetching BCV rate:', error.message);
            return this.rate;
        }
    }

    async fetchHistory() {
        try {
            const response = await fetch('https://bcv-api.rafnixg.dev/rates/history');
            if (response.ok) {
                return await response.json();
            }
            return [];
        } catch (error) {
            console.error('Error fetching history:', error.message);
            return [];
        }
    }

    setRate(newRate) {
        const rateData = {
            dollar: parseFloat(newRate),
            date: new Date().toISOString().split('T')[0],
            last_updated: new Date().toISOString(),
            manual: true
        };
        this.saveRate(rateData);
        return rateData;
    }

    getRate() {
        return this.rate;
    }
}

export default new BcvService();
