import request from 'supertest';
import app from '../../../index';
import prisma from '../../../db';
import { generateTestToken } from '../../helpers/testHelpers';

jest.mock('../../../db');

describe('Posts Routes', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    avatarUrl: null
  };

  const mockPost = {
    id: 1,
    title: 'Test Post',
    content: 'Test content for the post',
    slug: 'test-post-123',
    published: true,
    authorId: 1,
    viewsCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: mockUser,
    _count: { likes: 5, comments: 3 }
  };

  let authToken: string;

  beforeEach(() => {
    jest.clearAllMocks();
    authToken = generateTestToken(1, 'test@example.com');
  });

  describe('GET /api/posts', () => {
    it('should return paginated posts', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPost]);
      (prisma.post.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app).get('/api/posts');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.posts).toHaveLength(1);
    });

    it('should filter posts by search query', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPost]);
      (prisma.post.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app).get('/api/posts?search=test');

      expect(response.status).toBe(200);
      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array)
          })
        })
      );
    });

    it('should filter posts by authorId', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPost]);
      (prisma.post.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app).get('/api/posts?authorId=1');

      expect(response.status).toBe(200);
      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            authorId: 1
          })
        })
      );
    });

    it('should support pagination', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPost]);
      (prisma.post.count as jest.Mock).mockResolvedValue(25);

      const response = await request(app).get('/api/posts?page=2&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.pagination).toMatchObject({
        page: 2,
        limit: 10,
        total: 25,
        pages: 3
      });
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a single post by id', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.post.update as jest.Mock).mockResolvedValue(mockPost);

      const response = await request(app).get('/api/posts/1');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        title: 'Test Post'
      });
    });

    it('should increment view count', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.post.update as jest.Mock).mockResolvedValue(mockPost);

      await request(app).get('/api/posts/1');

      expect(prisma.post.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: { viewsCount: { increment: 1 } }
        })
      );
    });

    it('should return 404 for non-existent post', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/posts/999');

      expect(response.status).toBe(404);
    });

    it('should include isLiked status for authenticated user', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.post.update as jest.Mock).mockResolvedValue(mockPost);
      (prisma.like.findUnique as jest.Mock).mockResolvedValue({ id: 1 });

      const response = await request(app)
        .get('/api/posts/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('isLiked', true);
    });
  });

  describe('POST /api/posts', () => {
    it('should create a new post', async () => {
      (prisma.post.create as jest.Mock).mockResolvedValue(mockPost);

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Test Post',
          content: 'This is the content of the new post',
          published: true
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        title: 'Test Post'
      });
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({
          title: 'New Test Post',
          content: 'This is the content'
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid post data', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Sh',
          content: 'Too short'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/posts/:id', () => {
    it('should update a post', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.post.update as jest.Mock).mockResolvedValue({
        ...mockPost,
        title: 'Updated Title'
      });

      const response = await request(app)
        .patch('/api/posts/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
          content: 'Updated content'
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
    });

    it('should return 404 for non-existent post', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/posts/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(404);
    });

    it('should return 403 if user is not the author', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({
        ...mockPost,
        authorId: 2
      });

      const response = await request(app)
        .patch('/api/posts/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(403);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch('/api/posts/1')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete a post', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
      (prisma.post.delete as jest.Mock).mockResolvedValue(mockPost);

      const response = await request(app)
        .delete('/api/posts/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent post', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/posts/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 403 if user is not the author', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({
        ...mockPost,
        authorId: 2
      });

      const response = await request(app)
        .delete('/api/posts/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/posts/:id/like', () => {
    it('should like a post', async () => {
      (prisma.like.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.like.create as jest.Mock).mockResolvedValue({ id: 1 });

      const response = await request(app)
        .post('/api/posts/1/like')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: expect.any(String),
        liked: true
      });
    });

    it('should unlike a post if already liked', async () => {
      (prisma.like.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.like.delete as jest.Mock).mockResolvedValue({ id: 1 });

      const response = await request(app)
        .post('/api/posts/1/like')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: expect.any(String),
        liked: false
      });
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).post('/api/posts/1/like');

      expect(response.status).toBe(401);
    });
  });
});