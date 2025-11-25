// HTTP Logger para Debug Console
class HTTPLogger {
    constructor() {
        this.listeners = [];
    }

    addListener(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    logRequest(config) {
        const startTime = Date.now();

        // Store start time for duration calculation
        config.metadata = { startTime };

        const logEntry = {
            type: 'request',
            method: config.method?.toUpperCase() || 'GET',
            endpoint: config.url || '',
            timestamp: new Date().toISOString(),
            requestDetails: {
                url: config.baseURL ? `${config.baseURL}${config.url}` : config.url,
                method: config.method?.toUpperCase() || 'GET',
                headers: config.headers || {},
                body: config.data || null
            }
        };

        this.notify(logEntry);
        return config;
    }

    logResponse(response) {
        const duration = response.config.metadata?.startTime
            ? Date.now() - response.config.metadata.startTime
            : null;

        const logEntry = {
            type: 'response',
            method: response.config.method?.toUpperCase() || 'GET',
            endpoint: response.config.url || '',
            timestamp: new Date().toISOString(),
            statusCode: response.status,
            duration,
            requestDetails: {
                url: response.config.baseURL ? `${response.config.baseURL}${response.config.url}` : response.config.url,
                method: response.config.method?.toUpperCase() || 'GET',
                headers: response.config.headers || {},
                body: response.config.data || null
            },
            responseDetails: {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers || {},
                data: response.data
            },
            message: `${response.status} ${response.statusText}`
        };

        this.notify(logEntry);
        return response;
    }

    logError(error) {
        const duration = error.config?.metadata?.startTime
            ? Date.now() - error.config.metadata.startTime
            : null;

        const logEntry = {
            type: 'error',
            method: error.config?.method?.toUpperCase() || 'GET',
            endpoint: error.config?.url || '',
            timestamp: new Date().toISOString(),
            statusCode: error.response?.status || 0,
            duration,
            requestDetails: error.config ? {
                url: error.config.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config.url,
                method: error.config.method?.toUpperCase() || 'GET',
                headers: error.config.headers || {},
                body: error.config.data || null
            } : null,
            responseDetails: error.response ? {
                status: error.response.status,
                statusText: error.response.statusText,
                headers: error.response.headers || {},
                data: error.response.data
            } : null,
            message: error.message || 'Request failed'
        };

        this.notify(logEntry);
        return Promise.reject(error);
    }

    notify(logEntry) {
        this.listeners.forEach(listener => {
            try {
                listener(logEntry);
            } catch (err) {
                console.error('Error in HTTP logger listener:', err);
            }
        });
    }
}

export const httpLogger = new HTTPLogger();
