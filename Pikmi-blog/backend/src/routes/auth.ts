import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db';
import { validate, registerSchema, loginSchema } from '../middleware/validation';

const router = express.Router();

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { username, email, password, fullName } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        fullName
      }
    });

    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Вход выполнен успешно',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token не предоставлен' });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'default_refresh_secret'
    ) as { userId: number };

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ error: 'Недействительный refresh token' });
  }
});

export default router;
