import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { register, login, getProfile } from '../src/controllers/authController';
import { User } from '../src/models/User';
import { AppError } from '../src/middleware/errorHandler';

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

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: jest.fn(() => 'signed-token'),
  },
}));

jest.mock('../src/models/User', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  },
}));

const mockResponse = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authController', () => {
  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a new user and returns a token', async () => {
    jest.mocked(User.findOne).mockResolvedValue(null as never);
    jest.mocked(User.create).mockResolvedValue({
      _id: 'user-1',
      email: 'test@example.com',
      role: 'sales',
      name: 'Test User',
    } as never);

    const req = {
      body: { name: 'Test User', email: 'test@example.com', password: 'Password1', role: 'sales' },
    } as never;
    const res = mockResponse();

    await register(req, res, next);

    expect(User.create).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password1',
      role: 'sales',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  it('returns conflict when email already exists', async () => {
    jest.mocked(User.findOne).mockResolvedValue({ _id: 'existing' } as never);
    const req = { body: { email: 'test@example.com' } } as never;
    const res = mockResponse();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Email already registered' }));
  });

  it('logs in a user and returns user data with token', async () => {
    const user = {
      _id: 'user-1',
      email: 'test@example.com',
      role: 'sales',
      comparePassword: jest.fn().mockResolvedValue(true),
    };

    jest.mocked(User.findOne).mockReturnValue({
      select: jest.fn().mockResolvedValue(user),
    } as never);
    jest.mocked(User.findById).mockResolvedValue({
      _id: 'user-1',
      email: 'test@example.com',
      role: 'sales',
      name: 'Test User',
    } as never);

    const req = { body: { email: 'test@example.com', password: 'Password1' } } as never;
    const res = mockResponse();

    await login(req, res, next);

    expect(jwt.sign).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  it('passes AppError from getProfile when user is missing', async () => {
    const req = { user: undefined } as never;
    const res = mockResponse();

    await getProfile(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });
});