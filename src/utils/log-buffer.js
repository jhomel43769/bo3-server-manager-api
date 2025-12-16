class LogBuffer {
    static logs = [];
    static MAX_SIZE = 1000;

    static add(level, message) {
        if (!message || message.trim().length === 0) return;

        const entry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message.trim()
        };
        this.logs.push(entry);
        
        if (this.logs.length > this.MAX_SIZE) {
            this.logs.shift();
        }
    }

    static getLogs(limit = 50) {
        const safeLimit = Math.min(limit, this.MAX_SIZE);
        return this.logs.slice(-safeLimit);
    }

    static clear() {
        this.logs = [];
    }
}

export default LogBuffer;