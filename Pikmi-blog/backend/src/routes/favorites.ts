import express from 'express';
import prisma from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          post: {
            include: {
              author: {
                select: { id: true, username: true, avatarUrl: true }
              },
              _count: {
                select: { likes: true, comments: true }
              }
            }
          }
        }
      }),
      prisma.favorite.count({ where: { userId } })
    ]);

    const posts = favorites.map(f => f.post);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:postId', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const postId = parseInt(req.params.postId);

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_postId: { userId, postId }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Пост уже в избранном' });
    }

    const favorite = await prisma.favorite.create({
      data: { userId, postId }
    });

    res.status(201).json({ message: 'Добавлено в избранное', favorite });
  } catch (error) {
    next(error);
  }
});

router.delete('/:postId', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const postId = parseInt(req.params.postId);

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_postId: { userId, postId }
      }
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Пост не найден в избранном' });
    }

    await prisma.favorite.delete({
      where: { id: favorite.id }
    });

    res.json({ message: 'Удалено из избранного' });
  } catch (error) {
    next(error);
  }
});

export default router;
