import request from 'supertest';
import app from '../../../index';
import prisma from '../../../db';
import { generateTestToken } from '../../helpers/testHelpers';

jest.mock('../../../db');

describe('Users Routes', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    fullName: 'Test User',
    bio: 'Test bio',
    avatarUrl: 'https://example.com/avatar.jpg',
    createdAt: new Date(),
    _count: {
      posts: 5,
      followers: 10,
      following: 8
    }
  };

  const mockPost = {
    id: 1,
    title: 'Test Post',
    content: 'Test content',
    author: {
      id: 1,
      username: 'testuser',
      avatarUrl: null
    },
    _count: { likes: 5, comments: 3 }
  };

  let authToken: string;

  beforeEach(() => {
    jest.clearAllMocks();
    authToken = generateTestToken(1, 'test@example.com');
  });

  describe('GET /api/users/search', () => {
    it('should search users by username', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser]);

      const response = await request(app).get('/api/users/search?q=test');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        username: 'testuser'
      });
    });

    it('should return empty array for empty query', async () => {
      const response = await request(app).get('/api/users/search');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should limit results to 10 users', async () => {
      await request(app).get('/api/users/search?q=test');

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10
        })
      );
    });

    it('should search by username or fullName', async () => {
      await request(app).get('/api/users/search?q=test');

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { username: { contains: 'test', mode: 'insensitive' } },
              { fullName: { contains: 'test', mode: 'insensitive' } }
            ]
          }
        })
      );
    });
  });

  describe('GET /api/users/me', () => {
    it('should return current user profile', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      });
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/users/me');

      expect(response.status).toBe(401);
    });

    it('should include counts for posts, followers, and following', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body._count).toMatchObject({
        posts: 5,
        followers: 10,
        following: 8
      });
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user profile by id', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).get('/api/users/1');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        username: 'testuser'
      });
    });

    it('should return 404 for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/users/999');

      expect(response.status).toBe(404);
    });

    it('should not include email in public profile', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await request(app).get('/api/users/1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.not.objectContaining({
            email: true
          })
        })
      );
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update user profile', async () => {
      const updatedUser = { ...mockUser, bio: 'Updated bio' };
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bio: 'Updated bio',
          fullName: 'Updated Name'
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        bio: 'Updated bio'
      });
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch('/api/users/me')
        .send({ bio: 'New bio' });

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          avatarUrl: 'not-a-url'
        });

      expect(response.status).toBe(400);
    });

    it('should accept valid avatar URL', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          avatarUrl: 'https://example.com/new-avatar.jpg'
        });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/users/:id/posts', () => {
    it('should return user posts with pagination', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPost]);
      (prisma.post.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app).get('/api/users/1/posts');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should only return published posts', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPost]);
      (prisma.post.count as jest.Mock).mockResolvedValue(1);

      await request(app).get('/api/users/1/posts');

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            authorId: 1,
            published: true
          })
        })
      );
    });

    it('should support pagination', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPost]);
      (prisma.post.count as jest.Mock).mockResolvedValue(25);

      const response = await request(app).get('/api/users/1/posts?page=2');

      expect(response.status).toBe(200);
      expect(response.body.pagination).toMatchObject({
        page: 2,
        limit: 10,
        total: 25,
        pages: 3
      });
    });

    it('should order posts by createdAt desc', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPost]);
      (prisma.post.count as jest.Mock).mockResolvedValue(1);

      await request(app).get('/api/users/1/posts');

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' }
        })
      );
    });
  });
});