export const messageLog = {
    received: [],
    sent: [],
    errors: [],
    maxEntries: 500,
    addReceived(from, body) {
        this.received.push({ from, body, timestamp: new Date().toISOString() });
        if (this.received.length > this.maxEntries) this.received.shift();
    },
    addSent(to, body) {
        this.sent.push({ to, body, timestamp: new Date().toISOString() });
        if (this.sent.length > this.maxEntries) this.sent.shift();
    },
    addError(context, error) {
        const errMsg = error && (error.message || (typeof error.toString === 'function' ? error.toString() : String(error)));
        this.errors.push({ context, error: errMsg, timestamp: new Date().toISOString() });
        if (this.errors.length > this.maxEntries) this.errors.shift();
    },
    getAll() {
        return {
            received: [...this.received].reverse(),
            sent: [...this.sent].reverse(),
            errors: [...this.errors].reverse(),
        };
    },
};

export const globalState = {
    pairingCode: null,
    setPairingCode(code) {
        this.pairingCode = code;
    },
    getPairingCode() {
        return this.pairingCode;
    }
};
