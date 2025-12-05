/**
 * Production Logger Service
 * Winston + Sentry for production logging
 */

const winston = require('winston');
const Sentry = require('@sentry/node');

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || 'info';

// Initialize Sentry if DSN is provided
if (isProduction && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || 'production',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),
  });
}

// Custom format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  }),
);

// Configure transports
const transports = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: isProduction ? logFormat : consoleFormat,
  }),
);

// File transport for production
if (isProduction) {
  const logPath = process.env.LOG_FILE_PATH || '/var/log/botanical-audit';

  transports.push(
    new winston.transports.File({
      filename: `${logPath}/error.log`,
      level: 'error',
      format: logFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  );

  transports.push(
    new winston.transports.File({
      filename: `${logPath}/combined.log`,
      format: logFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
  );
}

// Logtail transport (if configured)
if (process.env.LOGTAIL_SOURCE_TOKEN) {
  const { Logtail } = require('@logtail/node');
  const { LogtailTransport } = require('@logtail/winston');

  const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);
  transports.push(new LogtailTransport(logtail));
}

// Create Winston logger
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: {
    service: 'botanical-audit-backend',
    environment: process.env.NODE_ENV,
  },
  transports,
});

// Wrap logger methods to send errors to Sentry
const originalError = logger.error.bind(logger);
const originalWarn = logger.warn.bind(logger);

logger.error = (message, ...meta) => {
  originalError(message, ...meta);

  if (isProduction && process.env.SENTRY_DSN) {
    if (message instanceof Error) {
      Sentry.captureException(message);
    } else {
      Sentry.captureMessage(message, 'error');
    }
  }
};

logger.warn = (message, ...meta) => {
  originalWarn(message, ...meta);

  if (isProduction && process.env.SENTRY_DSN && meta.some(m => m.critical)) {
    Sentry.captureMessage(message, 'warning');
  }
};

// Export logger and Sentry for manual usage
module.exports = logger;
module.exports.Sentry = Sentry;
