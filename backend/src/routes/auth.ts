import { Router } from 'express';
import { register, login, getProfile, forgotPassword, resetPassword } from '../controllers/authController';
import { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { wrapAsync } from '../utils/asyncHandler';

const router = Router();

router.post('/register', ...registerValidation, wrapAsync(register));
router.post('/login', ...loginValidation, wrapAsync(login));
router.post('/forgot-password', ...forgotPasswordValidation, wrapAsync(forgotPassword));
router.post('/reset-password', ...resetPasswordValidation, wrapAsync(resetPassword));
router.get('/profile', authenticate, wrapAsync(getProfile));

export default router;
