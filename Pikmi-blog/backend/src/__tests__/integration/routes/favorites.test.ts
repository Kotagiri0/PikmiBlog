import request from 'supertest';
import app from '../../../index';
import prisma from '../../../db';
import { generateTestToken } from '../../helpers/testHelpers';

jest.mock('../../../db');

describe('Favorites Routes', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    avatarUrl: null
  };

  const mockPost = {
    id: 1,
    title: 'Test Post',
    content: 'Test content',
    author: mockUser,
    _count: { likes: 5, comments: 3 }
  };

  const mockFavorite = {
    id: 1,
    userId: 1,
    postId: 1,
    createdAt: new Date(),
    post: mockPost
  };

  let authToken: string;

  beforeEach(() => {
    jest.clearAllMocks();
    authToken = generateTestToken(1, 'test@example.com');
  });

  describe('GET /api/favorites', () => {
    it('should return user favorites with pagination', async () => {
      (prisma.favorite.findMany as jest.Mock).mockResolvedValue([mockFavorite]);
      (prisma.favorite.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.posts).toHaveLength(1);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/favorites');

      expect(response.status).toBe(401);
    });

    it('should support pagination', async () => {
      (prisma.favorite.findMany as jest.Mock).mockResolvedValue([mockFavorite]);
      (prisma.favorite.count as jest.Mock).mockResolvedValue(25);

      const response = await request(app)
        .get('/api/favorites?page=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toMatchObject({
        page: 2,
        limit: 10,
        total: 25,
        pages: 3
      });
    });

    it('should order favorites by createdAt desc', async () => {
      (prisma.favorite.findMany as jest.Mock).mockResolvedValue([mockFavorite]);
      (prisma.favorite.count as jest.Mock).mockResolvedValue(1);

      await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`);

      expect(prisma.favorite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' }
        })
      );
    });
  });

  describe('POST /api/favorites/:postId', () => {
    it('should add post to favorites', async () => {
      (prisma.favorite.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.favorite.create as jest.Mock).mockResolvedValue(mockFavorite);

      const response = await request(app)
        .post('/api/favorites/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('favorite');
    });

    it('should return 400 if post is already in favorites', async () => {
      (prisma.favorite.findUnique as jest.Mock).mockResolvedValue(mockFavorite);

      const response = await request(app)
        .post('/api/favorites/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).post('/api/favorites/1');

      expect(response.status).toBe(401);
    });

    it('should use correct userId and postId', async () => {
      (prisma.favorite.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.favorite.create as jest.Mock).mockResolvedValue(mockFavorite);

      await request(app)
        .post('/api/favorites/5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(prisma.favorite.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { userId: 1, postId: 5 }
        })
      );
    });
  });

  describe('DELETE /api/favorites/:postId', () => {
    it('should remove post from favorites', async () => {
      (prisma.favorite.findUnique as jest.Mock).mockResolvedValue(mockFavorite);
      (prisma.favorite.delete as jest.Mock).mockResolvedValue(mockFavorite);

      const response = await request(app)
        .delete('/api/favorites/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 if post is not in favorites', async () => {
      (prisma.favorite.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/favorites/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).delete('/api/favorites/1');

      expect(response.status).toBe(401);
    });

    it('should use correct composite key for lookup', async () => {
      (prisma.favorite.findUnique as jest.Mock).mockResolvedValue(mockFavorite);
      (prisma.favorite.delete as jest.Mock).mockResolvedValue(mockFavorite);

      await request(app)
        .delete('/api/favorites/5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(prisma.favorite.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_postId: { userId: 1, postId: 5 }
          }
        })
      );
    });
  });
});