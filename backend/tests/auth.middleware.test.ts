import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { authenticate } from '../src/middleware/auth';
import { AuthenticatedRequest } from '../src/types';

// Mock config before importing middleware
jest.mock('../src/config/env', () => ({
  config: {
    jwtSecret: 'test-secret',
    jwtExpiresIn: '1h',
    port: 5000,
    mongoUri: 'mongodb://localhost/test',
    nodeEnv: 'test',
    bcryptRounds: 10,
    corsOrigin: 'http://localhost:3000',
    rateLimitWindowMs: 900000,
    rateLimitMax: 100,
  },
}));

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authenticate middleware', () => {
  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when no Authorization header', () => {
    const req = { headers: {} } as AuthenticatedRequest;
    const res = mockResponse();
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is malformed', () => {
    const req = {
      headers: { authorization: 'Bearer bad-token' },
    } as AuthenticatedRequest;
    const res = mockResponse();
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('calls next() and sets req.user on valid token', () => {
    const payload = { id: 'user-1', email: 'test@test.com', role: 'admin' };
    const token = jwt.sign(payload, 'test-secret');
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as AuthenticatedRequest;
    const res = mockResponse();
    authenticate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user?.email).toBe('test@test.com');
  });
});
