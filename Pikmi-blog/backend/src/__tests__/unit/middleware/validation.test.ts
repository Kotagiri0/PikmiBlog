import { Request, Response, NextFunction } from 'express';
import {
  validate,
  registerSchema,
  loginSchema,
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
  updateProfileSchema
} from '../../../middleware/validation';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();
  });

  describe('validate function', () => {
    it('should call next() with valid data', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      const middleware = validate(loginSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 400 with invalid data', () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: ''
      };

      const middleware = validate(loginSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Ошибка валидации',
          details: expect.any(Array)
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject short username', () => {
      const invalidData = {
        username: 'ab',
        email: 'test@example.com',
        password: 'password123'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '12345'
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional fullName', () => {
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User'
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createPostSchema', () => {
    it('should validate correct post data', () => {
      const validData = {
        title: 'Test Post Title',
        content: 'This is a test post content with enough characters.'
      };

      const result = createPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject short title', () => {
      const invalidData = {
        title: 'Test',
        content: 'This is a test post content.'
      };

      const result = createPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short content', () => {
      const invalidData = {
        title: 'Test Post Title',
        content: 'Short'
      };

      const result = createPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional published and tags', () => {
      const validData = {
        title: 'Test Post Title',
        content: 'This is a test post content.',
        published: true,
        tags: ['tag1', 'tag2']
      };

      const result = createPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('updatePostSchema', () => {
    it('should validate partial update data', () => {
      const validData = {
        title: 'Updated Title'
      };

      const result = updatePostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow empty object', () => {
      const validData = {};

      const result = updatePostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('createCommentSchema', () => {
    it('should validate correct comment data', () => {
      const validData = {
        content: 'This is a test comment'
      };

      const result = createCommentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty content', () => {
      const invalidData = {
        content: ''
      };

      const result = createCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional parentId', () => {
      const validData = {
        content: 'This is a reply',
        parentId: 1
      };

      const result = createCommentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('updateProfileSchema', () => {
    it('should validate partial profile update', () => {
      const validData = {
        fullName: 'John Doe',
        bio: 'Software developer'
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL for avatarUrl', () => {
      const invalidData = {
        avatarUrl: 'not-a-url'
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept valid URL for avatarUrl', () => {
      const validData = {
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});