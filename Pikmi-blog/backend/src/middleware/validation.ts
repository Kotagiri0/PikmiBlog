import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  fullName: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const createPostSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10),
  published: z.boolean().optional(),
  tags: z.array(z.string()).optional()
});

export const updatePostSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  content: z.string().min(10).optional(),
  published: z.boolean().optional(),
  tags: z.array(z.string()).optional()
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.number().optional()
});

export const updateProfileSchema = z.object({
  fullName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional()
});

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Ошибка валидации',
          details: error.errors
        });
      }
      next(error);
    }
  };
};
