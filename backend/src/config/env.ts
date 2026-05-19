import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  port: parseInt(process.env['PORT'] ?? '5000', 10),
  mongoUri: process.env['MONGODB_URI'] as string,
  jwtSecret: process.env['JWT_SECRET'] as string,
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d',
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  bcryptRounds: parseInt(process.env['BCRYPT_ROUNDS'] ?? '12', 10),
  corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
  rateLimitWindowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] ?? '900000', 10),
  rateLimitMax: parseInt(process.env['RATE_LIMIT_MAX'] ?? '100', 10),
} as const;
