import { Request, Response, NextFunction } from 'express';
import { sanitizeInput, limitRequestSize } from '../../../src/middleware/security';
import { AppError } from '../../../src/middleware/errorHandler';
import { createMockResponse } from '../setup';

describe('Security Middleware', () => {
    let req: Partial<Request>;
    let res: Response;
    let next: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            body: {},
            headers: {},
        };
        res = createMockResponse();
        next = jest.fn();
    });

    describe('sanitizeInput middleware', () => {
        describe('HTML sanitization', () => {
            it('should sanitize HTML tags from string values', () => {
                // ARRANGE
                req.body = {
                    name: '<script>alert("XSS")</script>John',
                    email: 'test@example.com',
                };

                // ACT
                sanitizeInput(req as Request, res, next);

                // ASSERT
                expect(req.body.name).not.toContain('<script>');
                expect(req.body.name).not.toContain('</script>');
                expect(req.body.email).toBe('test@example.com'); // Non-HTML string preserved
                expect(next).toHaveBeenCalledTimes(1);
            });

            it('should sanitize dangerous HTML attributes', () => {
                // ARRANGE
                req.body = {
                    comment: '<img src="x" onerror="alert(1)">',
                };

                // ACT
                sanitizeInput(req as Request, res, next);

                // ASSERT
                expect(req.body.comment).not.toContain('onerror');
                expect(next).toHaveBeenCalled();
            });

            it('should sanitize iframe and script injection attempts', () => {
                // ARRANGE
                req.body = {
                    content: '<iframe src="evil.com"></iframe>',
                    title: '<script src="malicious.js"></script>',
                };

                // ACT
                sanitizeInput(req as Request, res, next);

                // ASSERT
                expect(req.body.content).not.toContain('<iframe');
                expect(req.body.title).not.toContain('<script');
                expect(next).toHaveBeenCalled();
            });
        });

        describe('null byte removal', () => {
            it('should remove null bytes from strings', () => {
                // ARRANGE
                req.body = {
                    username: 'admin\0fake',
                    password: 'pass\0\0word',
                };

                // ACT
                sanitizeInput(req as Request, res, next);

                // ASSERT
                expect(req.body.username).toBe('adminfake'); // \0 removed
                expect(req.body.password).toBe('password'); // Multiple \0 removed
                expect(req.body.username).not.toContain('\0');
                expect(next).toHaveBeenCalled();
            });

            it('should handle strings with only null bytes', () => {
                // ARRANGE
                req.body = {
                    field: '\0\0\0',
                };

                // ACT
                sanitizeInput(req as Request, res, next);

                // ASSERT
                expect(req.body.field).toBe(''); // All null bytes removed
                expect(next).toHaveBeenCalled();
            });
        });

        describe('nested object sanitization', () => {
            it('should sanitize nested objects recursively', () => {
                // ARRANGE
                req.body = {
                    user: {
                        name: '<script>alert("nested")</script>John',
                        profile: {
                            bio: '<img src=x onerror=alert(1)>Test bio\0',
                            age: 25, // Number should be preserved
                        },
                    },
                };

                // ACT
                sanitizeInput(req as Request, res, next);

                // ASSERT
                expect(req.body.user.name).not.toContain('<script>');
                expect(req.body.user.profile.bio).not.toContain('\0'); // Null byte removed
                expect(req.body.user.profile.bio).not.toContain('onerror'); // Dangerous attribute removed
                expect(req.body.user.profile.age).toBe(25); // Number preserved
                expect(next).toHaveBeenCalled();
            });

            it('should handle deeply nested objects', () => {
                // ARRANGE
                req.body = {
                    level1: {
                        level2: {
                            level3: {
                                value: '<img src=x onerror=alert(1)>',
                            },
                        },
                    },
                };

                // ACT
                sanitizeInput(req as Request, res, next);

                // ASSERT
                expect(req.body.level1.level2.level3.value).not.toContain('onerror');
                expect(next).toHaveBeenCalled();
            });
        });

        describe('non-string value preservation', () => {
            it('should preserve numbers', () => {
                // ARRANGE
                req.body = {
                    age: 30,
                    price: 99.99,
                    count: 0,
                };

                // ACT
                sanitizeInput(req as Request, res, next);

                // ASSERT
                expect(req.body.age).toBe(30);
                expect(req.body.price).toBe(99.99);
                expect(req.body.count).toBe(0);
                expect(next).toHaveBeenCalled();
            });

            it('should preserve booleans', () => {
                // ARRANGE
                req.body = {
                    isActive: true,
                    isDeleted: false,
                };

                // ACT
                sanitizeInput(req as Request, res, next);

                // ASSERT
                expect(req.body.isActive).toBe(true);
                expect(req.body.isDeleted).toBe(false);
                expect(next).toHaveBeenCalled();
            });

            it('should preserve null values', () => {
                // ARRANGE
                req.body = {
                    optional: null,
                    name: 'test',
                };

                // ACT
                sanitizeInput(req as Request, res, next);

                // ASSERT
                expect(req.body.optional).toBe(null);
                expect(req.body.name).toBe('test');
                expect(next).toHaveBeenCalled();
            });
        });

        describe('edge cases', () => {
            it('should handle empty request body', () => {
                // ARRANGE
                req.body = {};

                // ACT
                sanitizeInput(req as Request, res, next);

                // ASSERT
                expect(req.body).toEqual({});
                expect(next).toHaveBeenCalled();
            });

            it('should handle request with no body', () => {
                // ARRANGE
                req.body = undefined;

                // ACT
                sanitizeInput(req as Request, res, next);

                // ASSERT
                expect(next).toHaveBeenCalled();
            });

            it('should handle empty strings', () => {
                // ARRANGE
                req.body = {
                    field1: '',
                    field2: 'value',
                };

                // ACT
                sanitizeInput(req as Request, res, next);

                // ASSERT
                expect(req.body.field1).toBe('');
                expect(req.body.field2).toBe('value');
                expect(next).toHaveBeenCalled();
            });

            it('should handle mixed content objects', () => {
                // ARRANGE
                req.body = {
                    text: '<script>xss</script>',
                    number: 42,
                    boolean: true,
                    nested: {
                        html: '<img src=x onerror=alert(1)>',
                        value: 100,
                    },
                };

                // ACT
                sanitizeInput(req as Request, res, next);

                // ASSERT
                expect(req.body.text).not.toContain('<script>'); // Dangerous tag removed
                expect(req.body.number).toBe(42); // Number preserved
                expect(req.body.boolean).toBe(true); // Boolean preserved
                expect(req.body.nested.html).not.toContain('onerror'); // Dangerous attribute removed
                expect(req.body.nested.value).toBe(100); // Number preserved
                expect(next).toHaveBeenCalled();
            });
        });
    });

    describe('limitRequestSize middleware', () => {
        describe('allowed requests', () => {
            it('should allow requests under 1MB limit', () => {
                // ARRANGE
                const smallSize = 500 * 1024; // 500KB
                req.headers = { 'content-length': smallSize.toString() };

                // ACT
                limitRequestSize(req as Request, res, next);

                // ASSERT
                expect(next).toHaveBeenCalledTimes(1);
                expect(next).toHaveBeenCalledWith(); // Called without arguments
            });

            it('should allow requests with no Content-Length header', () => {
                // ARRANGE
                req.headers = {}; // No content-length header

                // ACT
                limitRequestSize(req as Request, res, next);

                // ASSERT
                expect(next).toHaveBeenCalledTimes(1);
            });

            it('should allow very small requests', () => {
                // ARRANGE
                req.headers = { 'content-length': '100' }; // 100 bytes

                // ACT
                limitRequestSize(req as Request, res, next);

                // ASSERT
                expect(next).toHaveBeenCalled();
            });

            it('should allow requests at exactly 1MB', () => {
                // ARRANGE
                const exactlyOneMB = 1024 * 1024; // Exactly 1MB
                req.headers = { 'content-length': exactlyOneMB.toString() };

                // ACT
                limitRequestSize(req as Request, res, next);

                // ASSERT
                expect(next).toHaveBeenCalled();
            });
        });

        describe('rejected requests', () => {
            it('should throw AppError(413) when request exceeds 1MB', () => {
                // ARRANGE
                const largeSize = 2 * 1024 * 1024; // 2MB
                req.headers = { 'content-length': largeSize.toString() };

                // ACT & ASSERT
                expect(() => limitRequestSize(req as Request, res, next)).toThrow(AppError);
                expect(() => limitRequestSize(req as Request, res, next)).toThrow('Request entity too large');

                // Verify next() was NOT called
                expect(next).not.toHaveBeenCalled();
            });

            it('should throw AppError(413) for requests just over 1MB', () => {
                // ARRANGE
                const justOverOneMB = 1024 * 1024 + 1; // 1MB + 1 byte
                req.headers = { 'content-length': justOverOneMB.toString() };

                // ACT & ASSERT
                expect(() => limitRequestSize(req as Request, res, next)).toThrow(AppError);
                expect(() => limitRequestSize(req as Request, res, next)).toThrow('Request entity too large');

                expect(next).not.toHaveBeenCalled();
            });

            it('should throw AppError(413) for extremely large requests', () => {
                // ARRANGE
                const hugeSize = 100 * 1024 * 1024; // 100MB
                req.headers = { 'content-length': hugeSize.toString() };

                // ACT & ASSERT
                expect(() => limitRequestSize(req as Request, res, next)).toThrow(AppError);
                expect(() => limitRequestSize(req as Request, res, next)).toThrow('Request entity too large');

                expect(next).not.toHaveBeenCalled();
            });
        });

        describe('edge cases', () => {
            it('should handle Content-Length as string "0"', () => {
                // ARRANGE
                req.headers = { 'content-length': '0' };

                // ACT
                limitRequestSize(req as Request, res, next);

                // ASSERT
                expect(next).toHaveBeenCalled();
            });

            it('should handle invalid Content-Length (NaN)', () => {
                // ARRANGE
                req.headers = { 'content-length': 'invalid' };

                // ACT
                limitRequestSize(req as Request, res, next);

                // ASSERT
                // parseInt('invalid') returns NaN, which is not > maxSize
                expect(next).toHaveBeenCalled();
            });

            it('should handle negative Content-Length', () => {
                // ARRANGE
                req.headers = { 'content-length': '-100' };

                // ACT
                limitRequestSize(req as Request, res, next);

                // ASSERT
                // Negative number is not > maxSize
                expect(next).toHaveBeenCalled();
            });
        });
    });
});
