import mongoose from 'mongoose';
import { Response } from 'express';
import { errorHandler, notFoundHandler, AppError } from '../src/middleware/errorHandler';
import { sendError } from '../src/utils/response';

jest.mock('../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

jest.mock('../src/utils/response', () => ({
  sendError: jest.fn(),
}));

const mockResponse = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('errorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles AppError responses', () => {
    const res = mockResponse();

    errorHandler(new AppError('Boom', 418), {} as never, res, {} as never);

    expect(sendError).toHaveBeenCalledWith(res, 'Boom', 418);
  });

  it('handles validation errors', () => {
    const validationError = new mongoose.Error.ValidationError();
    validationError.errors['email'] = {
      name: 'ValidatorError',
      message: 'Email is invalid',
      path: 'email',
      kind: 'required',
      value: 'bad-email',
    } as never;

    const res = mockResponse();

    errorHandler(validationError, {} as never, res, {} as never);

    expect(sendError).toHaveBeenCalledWith(
      res,
      'Validation failed',
      400,
      expect.arrayContaining([{ field: 'email', message: 'Email is invalid' }])
    );
  });

  it('handles cast errors and duplicate keys', () => {
    const res = mockResponse();
    errorHandler(new mongoose.Error.CastError('ObjectId', 'bad', 'id'), {} as never, res, {} as never);
    expect(sendError).toHaveBeenCalledWith(res, 'Invalid id: bad', 400);

    jest.clearAllMocks();
    errorHandler(
      Object.assign(new Error('dup'), { code: 11000, keyValue: { email: 'x@example.com' } }),
      {} as never,
      res,
      {} as never
    );
    expect(sendError).toHaveBeenCalledWith(res, 'email already exists', 409);
  });

  it('handles not found responses', () => {
    const res = mockResponse();
    notFoundHandler({} as never, res);
    expect(sendError).toHaveBeenCalledWith(res, 'Route not found', 404);
  });
});