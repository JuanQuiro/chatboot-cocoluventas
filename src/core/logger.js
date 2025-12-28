/**
 * Structured Logger using Pino
 */

import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

export const logger = pino({
    level: logLevel,
    transport: !isProduction ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname'
        }
    } : undefined,
    formatters: {
        level: (label) => {
            return { level: label };
        }
    },
    serializers: {
        err: pino.stdSerializers.err,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res
    }
});

// Helper functions
export const logInfo = (message, data = {}) => logger.info(data, message);
export const logError = (message, error, data = {}) => logger.error({ err: error, ...data }, message);
export const logWarn = (message, data = {}) => logger.warn(data, message);
export const logDebug = (message, data = {}) => logger.debug(data, message);
