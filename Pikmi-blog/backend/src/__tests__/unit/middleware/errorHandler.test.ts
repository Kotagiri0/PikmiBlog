import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../../middleware/errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();
    console.error = jest.fn();
  });

  it('should handle Prisma P2002 error (unique constraint)', () => {
    const error = {
      code: 'P2002',
      message: 'Unique constraint failed'
    };

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Такая запись уже существует'
    });
  });

  it('should handle Prisma P2025 error (record not found)', () => {
    const error = {
      code: 'P2025',
      message: 'Record to delete does not exist'
    };

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Запись не найдена'
    });
  });

  it('should handle custom status code error', () => {
    const error = {
      statusCode: 400,
      message: 'Bad request'
    };

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Bad request'
    });
  });

  it('should handle generic error with 500 status', () => {
    const error = new Error('Something went wrong');

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Something went wrong'
    });
  });

  it('should include stack trace in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error = {
      message: 'Test error',
      stack: 'Error stack trace'
    };

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Test error',
      stack: 'Error stack trace'
    });

    process.env.NODE_ENV = originalEnv;
  });

  it('should not include stack trace in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = {
      message: 'Test error',
      stack: 'Error stack trace'
    };

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Test error'
    });

    process.env.NODE_ENV = originalEnv;
  });
});