import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';

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

// Content Security Policy headers
export const setCSPHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self'; " +
    "font-src 'self'; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );
  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

// Request size limiting
export const limitRequestSize = (req: Request, res: Response, next: NextFunction) => {
  const maxSize = 1024 * 1024; // 1MB limit
  
  if (req.headers['content-length']) {
    const contentLength = parseInt(req.headers['content-length']);
    if (contentLength > maxSize) {
      return res.status(413).json({ 
        error: 'Request entity too large',
        maxSize: `${maxSize / 1024 / 1024}MB`
      });
    }
  }
  
  next();
};