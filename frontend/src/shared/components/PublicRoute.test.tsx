import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicRoute } from './PublicRoute';
import { useAuth } from '../contexts/AuthContext';

// Mock useAuth
vi.mock('../contexts/AuthContext');

describe('PublicRoute', () => {
  it('should render children when user is not authenticated', () => {
    // Mock unauthenticated user
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
    } as any);

    render(
      <BrowserRouter>
        <PublicRoute>
          <div>Login Page</div>
        </PublicRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('should redirect to /todos when user is already authenticated', () => {
    // Mock authenticated user
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
    } as any);

    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <div>Login Page</div>
              </PublicRoute>
            }
          />
          <Route path="/todos" element={<div>Todos Page</div>} />
        </Routes>
      </BrowserRouter>
    );

    // Should redirect to /todos, so we see Todos Page
    expect(screen.getByText('Todos Page')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
