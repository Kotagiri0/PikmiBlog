import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Ошибка:', err);

  // Ошибки Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Такая запись уже существует'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Запись не найдена'
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Внутренняя ошибка сервера';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
