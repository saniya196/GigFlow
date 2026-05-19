import winston from 'winston';
import { config } from '../config/env';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: config.nodeEnv === 'development' }),
  winston.format.printf((info) => {
    const timestamp = String(info.timestamp ?? 'unknown-time');
    const level = String(info.level);
    const message = String(info.message);
    const stack = typeof info.stack === 'string' ? info.stack : undefined;

    return stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}`
      : `[${timestamp}] ${level}: ${message}`;
  })
);

export const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'warn' : 'debug',
  format: logFormat,
  // In container platforms like Render, filesystem writes may be restricted.
  // Keep logs on stdout/stderr so the platform can capture them.
  transports: [new winston.transports.Console()],
});
