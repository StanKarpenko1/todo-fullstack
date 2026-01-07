import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import type { User } from '@features/auth/types/auth.types';

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start with no authenticated user', () => {
    // ACT
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider, 
    });

    // ASSERT
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login user and store token', () => {
    // ARRANGE
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    };
    const mockToken = 'test-token-123';

    // ACT
    act(() => {
      result.current.login(mockToken, mockUser);
    });

    // ASSERT
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('token')).toBe(mockToken);
  });

  it('should logout user and remove token', () => {
    // ARRANGE
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    };

    act(() => {
      result.current.login('test-token', mockUser);
    });

    // ACT
    act(() => {
      result.current.logout();
    });

    // ASSERT
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should persist auth state on mount if token exists', () => {
    // ARRANGE - Simulate existing auth state
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    };
    localStorage.setItem('token', 'existing-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    // ACT - Mount provider (simulates app load)
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // ASSERT
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // ACT & ASSERT
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within AuthProvider');
  });
});
