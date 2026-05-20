import crypto from 'crypto';
import { User } from '../models/User';
import { logger } from './logger';

export const generatePasswordResetToken = (): { token: string; hash: string } => {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
};

export const savePasswordResetToken = async (
  email: string,
  tokenHash: string,
  expiryMinutes: number = 30
): Promise<boolean> => {
  try {
    const expiryDate = new Date(Date.now() + expiryMinutes * 60 * 1000);
    await User.findOneAndUpdate(
      { email },
      {
        passwordResetToken: tokenHash,
        passwordResetExpiry: expiryDate,
      },
      { new: true }
    );
    return true;
  } catch (error) {
    logger.error('Failed to save password reset token:', error);
    return false;
  }
};

export const verifyPasswordResetToken = async (email: string, tokenHash: string): Promise<boolean> => {
  try {
    const user = await User.findOne({
      email,
      passwordResetToken: tokenHash,
      passwordResetExpiry: { $gt: new Date() },
    });
    return !!user;
  } catch (error) {
    logger.error('Failed to verify password reset token:', error);
    return false;
  }
};

export const clearPasswordResetToken = async (email: string): Promise<boolean> => {
  try {
    await User.findOneAndUpdate(
      { email },
      {
        passwordResetToken: undefined,
        passwordResetExpiry: undefined,
      },
      { new: true }
    );
    return true;
  } catch (error) {
    logger.error('Failed to clear password reset token:', error);
    return false;
  }
};

export const generatePasswordResetUrl = (token: string, frontendUrl: string): string => {
  return `${frontendUrl}/reset-password?token=${token}`;
};

export const formatPasswordResetEmail = (name: string, resetUrl: string): { subject: string; html: string } => {
  const subject = 'Reset Your GigFlow Password';
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #0ea5e9; margin-bottom: 20px;">Password Reset Request</h1>
        
        <p>Hi ${name},</p>
        
        <p>We received a request to reset your GigFlow password. Click the button below to create a new password:</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">This link will expire in 30 minutes for security reasons.</p>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;
  return { subject, html };
};
