import jwt from 'jsonwebtoken';

export const generateTestToken = (userId: number, email: string = 'test@test.com') => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
};

export const mockUser = {
  id: 1,
  email: 'test@test.com',
  username: 'testuser',
  password: '$2b$10$hashedpassword',
  bio: 'Test bio',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

export const mockPost = {
  id: 1,
  title: 'Test Post',
  content: 'Test content',
  imageUrl: 'https://example.com/image.jpg',
  authorId: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

export const mockComment = {
  id: 1,
  content: 'Test comment',
  postId: 1,
  authorId: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

export const mockFavorite = {
  id: 1,
  userId: 1,
  postId: 1,
  createdAt: new Date('2024-01-01')
};