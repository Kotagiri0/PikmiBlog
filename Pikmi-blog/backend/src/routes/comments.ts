import express from 'express';
import prisma from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate, createCommentSchema } from '../middleware/validation';

const router = express.Router();

router.get('/post/:postId', async (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId);

    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true }
        },
        replies: {
          include: {
            author: {
              select: { id: true, username: true, avatarUrl: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(comments);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateToken, validate(createCommentSchema), async (req: AuthRequest, res, next) => {
  try {
    const { content, postId, parentId } = req.body;
    const userId = req.userId!;

    const comment = await prisma.comment.create({
      data: {
        content,
        postId: parseInt(postId),
        authorId: userId,
        parentId: parentId ? parseInt(parentId) : null
      },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const commentId = parseInt(req.params.id);
    const userId = req.userId!;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment) {
      return res.status(404).json({ error: 'Комментарий не найден' });
    }

    if (comment.authorId !== userId) {
      return res.status(403).json({ error: 'Нет прав на удаление' });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    res.json({ message: 'Комментарий удалён' });
  } catch (error) {
    next(error);
  }
});

export default router;
