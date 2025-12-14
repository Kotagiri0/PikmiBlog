import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, optionalAuth, AuthRequest } from '../../../middleware/auth';

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should return 401 if no token is provided', () => {
      authenticateToken(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Токен не предоставлен' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 if token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid_token'
      };

      authenticateToken(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Недействительный токен' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() with valid token', () => {
      const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET || 'test-secret-key');
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      authenticateToken(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockRequest.userId).toBe(1);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should extract userId from token payload', () => {
      const userId = 42;
      const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret-key');
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      authenticateToken(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockRequest.userId).toBe(userId);
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should call next() if no token is provided', () => {
      optionalAuth(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.userId).toBeUndefined();
    });

    it('should call next() with invalid token without error', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid_token'
      };

      optionalAuth(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.userId).toBeUndefined();
    });

    it('should set userId with valid token', () => {
      const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET || 'test-secret-key');
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      optionalAuth(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockRequest.userId).toBe(1);
      expect(nextFunction).toHaveBeenCalled();
    });
  });
});