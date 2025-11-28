import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, forgotPassword, resetPassword } from '../controllers/auth.controller';

const router = express.Router();

// Rate limiter for password reset (prevent spam)
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many password reset attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

export default router;





