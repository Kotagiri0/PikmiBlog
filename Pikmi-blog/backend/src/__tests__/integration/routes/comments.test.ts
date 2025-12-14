import request from 'supertest';
import app from '../../../index';
import prisma from '../../../db';
import { generateTestToken } from '../../helpers/testHelpers';

jest.mock('../../../db');

describe('Comments Routes', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    avatarUrl: null
  };

  const mockComment = {
    id: 1,
    content: 'Test comment',
    postId: 1,
    authorId: 1,
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: mockUser,
    replies: []
  };

  let authToken: string;

  beforeEach(() => {
    jest.clearAllMocks();
    authToken = generateTestToken(1, 'test@example.com');
  });

  describe('GET /api/comments/post/:postId', () => {
    it('should return comments for a post', async () => {
      (prisma.comment.findMany as jest.Mock).mockResolvedValue([mockComment]);

      const response = await request(app).get('/api/comments/post/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        id: 1,
        content: 'Test comment'
      });
    });

    it('should only return top-level comments (parentId: null)', async () => {
      await request(app).get('/api/comments/post/1');

      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { postId: 1, parentId: null }
        })
      );
    });

    it('should include author and replies', async () => {
      const commentWithReplies = {
        ...mockComment,
        replies: [
          {
            id: 2,
            content: 'Reply to comment',
            author: mockUser
          }
        ]
      };

      (prisma.comment.findMany as jest.Mock).mockResolvedValue([commentWithReplies]);

      const response = await request(app).get('/api/comments/post/1');

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty('author');
      expect(response.body[0]).toHaveProperty('replies');
    });

    it('should order comments by createdAt desc', async () => {
      await request(app).get('/api/comments/post/1');

      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' }
        })
      );
    });
  });

  describe('POST /api/comments', () => {
    it('should create a new comment', async () => {
      (prisma.comment.create as jest.Mock).mockResolvedValue(mockComment);

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'New test comment',
          postId: 1
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        content: 'Test comment',
        postId: 1
      });
    });

    it('should create a reply to a comment', async () => {
      const replyComment = { ...mockComment, parentId: 1 };
      (prisma.comment.create as jest.Mock).mockResolvedValue(replyComment);

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Reply to comment',
          postId: 1,
          parentId: 1
        });

      expect(response.status).toBe(201);
      expect(prisma.comment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            parentId: 1
          })
        })
      );
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/comments')
        .send({
          content: 'New test comment',
          postId: 1
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid comment data', async () => {
      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: '',
          postId: 1
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/comments/:id', () => {
    it('should delete a comment', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);
      (prisma.comment.delete as jest.Mock).mockResolvedValue(mockComment);

      const response = await request(app)
        .delete('/api/comments/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent comment', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/comments/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 403 if user is not the author', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue({
        ...mockComment,
        authorId: 2
      });

      const response = await request(app)
        .delete('/api/comments/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).delete('/api/comments/1');

      expect(response.status).toBe(401);
    });
  });
});