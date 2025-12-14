import express from 'express';
import prisma from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate, updateProfileSchema } from '../middleware/validation';

const router = express.Router();


router.get('/search', async (req, res, next) => {
  try {
    const query = req.query.q as string;

    if (!query) {
      return res.json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        bio: true
      },
      take: 10
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true
          }
        }
      }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.patch('/me', authenticateToken, validate(updateProfileSchema), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { fullName, bio, avatarUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { fullName, bio, avatarUrl }
    });

    res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      bio: updatedUser.bio,
      avatarUrl: updatedUser.avatarUrl
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/posts', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: userId, published: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, username: true, avatarUrl: true }
          },
          _count: {
            select: { likes: true, comments: true }
          }
        }
      }),
      prisma.post.count({ where: { authorId: userId, published: true } })
    ]);

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

export default router;
