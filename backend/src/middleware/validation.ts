import { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { sendError } from '../utils/response';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg as string,
    }));
    sendError(res, 'Validation failed', 400, formattedErrors);
    return;
  }
  next();
};

export const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number'),
  body('role').optional().isIn(['admin', 'sales']).withMessage('Role must be admin or sales'),
  handleValidationErrors,
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

export const createLeadValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('status')
    .isIn(['New', 'Contacted', 'Qualified', 'Lost'])
    .withMessage('Status must be New, Contacted, Qualified, or Lost'),
  body('source')
    .isIn(['Website', 'Instagram', 'Referral'])
    .withMessage('Source must be Website, Instagram, or Referral'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid assignedTo ID'),
  handleValidationErrors,
];

export const updateLeadValidation = [
  param('id').isMongoId().withMessage('Invalid lead ID'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Qualified', 'Lost'])
    .withMessage('Invalid status'),
  body('source')
    .optional()
    .isIn(['Website', 'Instagram', 'Referral'])
    .withMessage('Invalid source'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
  handleValidationErrors,
];

export const leadsQueryValidation = [
  query('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Lost']).withMessage('Invalid status'),
  query('source').optional().isIn(['Website', 'Instagram', 'Referral']).withMessage('Invalid source'),
  query('search').optional().isString().isLength({ max: 100 }).withMessage('Search term too long'),
  query('sort').optional().isIn(['latest', 'oldest']).withMessage('Sort must be latest or oldest'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

export const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  handleValidationErrors,
];

export const resetPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('token').trim().notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number'),
  handleValidationErrors,
];
