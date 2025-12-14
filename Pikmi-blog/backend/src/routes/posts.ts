import express from 'express';
import prisma from '../db';
import { authenticateToken, optionalAuth, AuthRequest } from '../middleware/auth';
import { validate, createPostSchema, updatePostSchema } from '../middleware/validation';

const router = express.Router();

router.get('/', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const authorId = req.query.authorId ? parseInt(req.query.authorId as string) : undefined;

    const skip = (page - 1) * limit;

    const where: any = { published: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (authorId) {
      where.authorId = authorId;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
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
      prisma.post.count({ where })
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

router.get('/:id', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const postId = parseInt(req.params.id);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatarUrl: true }
        },
        tags: {
          include: { tag: true }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Пост не найден' });
    }

    await prisma.post.update({
      where: { id: postId },
      data: { viewsCount: { increment: 1 } }
    });

    let isLiked = false;
    if (req.userId) {
      const like = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: req.userId,
            postId
          }
        }
      });
      isLiked = !!like;
    }

    res.json({ ...post, isLiked });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateToken, validate(createPostSchema), async (req: AuthRequest, res, next) => {
  try {
    const { title, content, published, tags } = req.body;
    const userId = req.userId!;

    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Date.now();

    const post = await prisma.post.create({
      data: {
        title,
        content,
        slug,
        published: published || false,
        authorId: userId
      }
    });

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authenticateToken, validate(updatePostSchema), async (req: AuthRequest, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.userId!;
    const { title, content, published } = req.body;

    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ error: 'Пост не найден' });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({ error: 'Нет прав на редактирование' });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { title, content, published }
    });

    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.userId!;

    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ error: 'Пост не найден' });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({ error: 'Нет прав на удаление' });
    }

    await prisma.post.delete({ where: { id: postId } });

    res.json({ message: 'Пост удалён' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/like', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.userId!;

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId }
      }
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      return res.json({ message: 'Лайк убран', liked: false });
    } else {
      await prisma.like.create({
        data: { userId, postId }
      });
      return res.json({ message: 'Лайк поставлен', liked: true });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
