import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';
import { AppError } from './errorHandler';

// Input sanitization middleware 
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Remove null bytes and clean HTML
      return DOMPurify.sanitize(value.replace(/\0/g, ''));
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  next();
};

// Note: CSP and other security headers are now handled by Helmet in server.ts
// This keeps the middleware focused on application-specific security functions

// Request size limiting
export const limitRequestSize = (req: Request, res: Response, next: NextFunction) => {
  const maxSize = 1024 * 1024; // 1MB limit

  if (req.headers['content-length']) {
    const contentLength = parseInt(req.headers['content-length']);
    if (contentLength > maxSize) {
      // Throw AppError instead of manual response (consistent with other middleware)
      throw new AppError(413, 'Request entity too large. Maximum size: 1MB');
    }
  }

  next();
};