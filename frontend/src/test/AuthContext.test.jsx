import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';

function TestConsumer() {
  const { user, token, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</span>
      <span data-testid="user-email">{user?.email || 'none'}</span>
      <span data-testid="user-role">{user?.role || 'none'}</span>
      <span data-testid="token">{token || 'none'}</span>
      <button
        onClick={() =>
          login({
            user: { email: 'student@example.com', role: 'STUDENT' },
            token: 'fake-jwt-token-xyz',
            refreshToken: 'fake-refresh-token-123',
          })
        }
      >
        Trigger Login
      </button>
      <button onClick={logout}>Trigger Logout</button>
    </div>
  );
}

describe('AuthContext & AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it('initializes as unauthenticated when localStorage is empty', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('none');
    expect(screen.getByTestId('token')).toHaveTextContent('none');
  });

  it('initializes with stored credentials from localStorage', () => {
    localStorage.setItem(
      'authUser',
      JSON.stringify({ email: 'saved@example.com', role: 'LANDLORD' })
    );
    localStorage.setItem('authToken', 'saved-jwt-token');

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('saved@example.com');
    expect(screen.getByTestId('user-role')).toHaveTextContent('LANDLORD');
    expect(screen.getByTestId('token')).toHaveTextContent('saved-jwt-token');
  });

  it('updates state and persists tokens to localStorage on login()', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Trigger Login'));

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('student@example.com');
    expect(screen.getByTestId('token')).toHaveTextContent('fake-jwt-token-xyz');

    await waitFor(() => {
      expect(localStorage.getItem('authToken')).toBe('fake-jwt-token-xyz');
      expect(localStorage.getItem('refreshToken')).toBe('fake-refresh-token-123');
      const storedUser = JSON.parse(localStorage.getItem('authUser') || '{}');
      expect(storedUser.email).toBe('student@example.com');
    });
  });

  it('clears state and removes tokens from localStorage on logout()', async () => {
    localStorage.setItem(
      'authUser',
      JSON.stringify({ email: 'active@example.com', role: 'STUDENT' })
    );
    localStorage.setItem('authToken', 'active-token');
    localStorage.setItem('refreshToken', 'active-refresh');

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');

    fireEvent.click(screen.getByText('Trigger Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('none');
      expect(screen.getByTestId('token')).toHaveTextContent('none');
      expect(localStorage.getItem('authUser')).toBeNull();
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });
});
