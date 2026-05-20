import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { AuthenticatedRequest, LoginDto, RegisterDto } from '../types';
import { config } from '../config/env';
import { sendSuccess, sendCreated, sendError } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { generatePasswordResetToken, savePasswordResetToken, verifyPasswordResetToken, clearPasswordResetToken, generatePasswordResetUrl } from '../utils/passwordReset';
import { logger } from '../utils/logger';

const generateToken = (id: string, email: string, role: string): string => {
  return jwt.sign({ id, email, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
};

export const register = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body as RegisterDto;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendError(res, 'Email already registered', 409);
      return;
    }

    const user = await User.create({ name, email, password, role: role ?? 'sales' });
    const token = generateToken(user._id.toString(), user.email, user.role);

    sendCreated(res, { user, token }, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as LoginDto;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    const token = generateToken(user._id.toString(), user.email, user.role);
    const userWithoutPassword = await User.findById(user._id);

    sendSuccess(res, { user: userWithoutPassword, token }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const user = await User.findById(req.user.id);
    if (!user) throw new AppError('User not found', 404);

    sendSuccess(res, { user }, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body as { email: string };

    const user = await User.findOne({ email });
    if (!user) {
      sendSuccess(res, {}, 'If an account exists with this email, you will receive password reset instructions');
      return;
    }

    const { token, hash } = generatePasswordResetToken();
    const saved = await savePasswordResetToken(email, hash);

    if (!saved) throw new AppError('Failed to process request', 500);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = generatePasswordResetUrl(token, frontendUrl);

    logger.info(`Password reset link for ${email}: ${resetUrl}`);

    sendSuccess(res, {}, 'Password reset instructions sent to your email');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, token, newPassword } = req.body as { email: string; token: string; newPassword: string };

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const isValid = await verifyPasswordResetToken(email, tokenHash);

    if (!isValid) {
      sendError(res, 'Invalid or expired reset token', 400);
      return;
    }

    const user = await User.findOne({ email });
    if (!user) throw new AppError('User not found', 404);

    user.password = newPassword;
    await user.save();

    await clearPasswordResetToken(email);

    sendSuccess(res, {}, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};
