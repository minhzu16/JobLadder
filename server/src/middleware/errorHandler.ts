import { Request, Response, NextFunction } from 'express';

// Centralized Error Handler Middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error Handler] Uncaught Exception:', err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi hệ thống Server. Vui lòng thử lại sau.';

  res.status(statusCode).json({
    status: 'error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Only show stack in dev
  });
};
