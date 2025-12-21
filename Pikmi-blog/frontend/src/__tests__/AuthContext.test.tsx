import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../api/axios');

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('должен инициализировать с неавторизованным пользователем', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });

  it('должен выполнять вход пользователя', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    };

    const mockResponse = {
      data: {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        user: mockUser,
      },
    };

    (axios.post as any).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'test-token');
    expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token');
  });

  it('должен регистрировать нового пользователя', async () => {
    const mockUser = {
      id: 1,
      username: 'newuser',
      email: 'new@example.com',
    };

    const mockResponse = {
      data: {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        user: mockUser,
      },
    };

    (axios.post as any).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.register('newuser', 'new@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('должен выполнять выход пользователя', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
    expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
  });
});