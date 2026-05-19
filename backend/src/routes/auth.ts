import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { registerValidation, loginValidation } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { wrapAsync } from '../utils/asyncHandler';

const router = Router();

router.post('/register', ...registerValidation, wrapAsync(register));
router.post('/login', ...loginValidation, wrapAsync(login));
router.get('/profile', authenticate, wrapAsync(getProfile));

export default router;
