import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routers/auth';
import todoRoutes from './routers/todos';

// Import security middleware
import { sanitizeInput, limitRequestSize } from './middleware/security';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables (silent in test mode)
dotenv.config({ debug: false });

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Security middleware
app.use(
  helmet({
    // Disable deprecated X-XSS-Protection header
    xssFilter: false,

    // Configure Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },

    // Configure HSTS for production
    hsts:
      process.env.NODE_ENV === 'production'
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          }
        : false,

    // Configure referrer policy
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  })
);

app.use(cors());
app.use(limitRequestSize);

// Body parsing middleware (before routes)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health check endpoint (bypasses rate limiter)
app.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Rate limiting (after health check)
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Input sanitization
app.use(sanitizeInput);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Error handler middleware (MUST be last)
app.use(errorHandler);

export { app };

// Start server only when running directly (not during testing)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(
      `Auth endpoints: http://localhost:${PORT}/api/auth/register & /api/auth/login`
    );
  });
}
