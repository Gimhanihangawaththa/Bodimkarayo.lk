import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Header from '../components/Header';
import { AuthProvider } from '../context/AuthContext';

// Mock dependencies
vi.mock('../services', () => ({
  searchService: {
    globalSearch: vi.fn().mockResolvedValue({ properties: [], roommates: [] }),
  },
}));

vi.mock('../config/api.config', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: { count: 0 } }),
  },
}));

vi.mock('../assets/logo.png', () => ({
  default: 'mock-logo.png',
}));

describe('Header Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders brand logo and primary navigation links', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </MemoryRouter>
    );

    // Brand logo
    const logoImg = screen.getByAltText('Bodimkarayo.lk');
    expect(logoImg).toBeInTheDocument();

    // Primary navigation links (desktop)
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('Roommates')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
  });

  it('shows Sign In button when user is unauthenticated', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </MemoryRouter>
    );

    const signInButtons = screen.getAllByRole('link', { name: /sign in/i });
    expect(signInButtons.length).toBeGreaterThan(0);
  });

  it('displays user profile initials when user is authenticated', async () => {
    localStorage.setItem(
      'authUser',
      JSON.stringify({ id: 1, fullName: 'Kasun Perera', email: 'kasun@example.com' })
    );
    localStorage.setItem('authToken', 'mock-jwt-token');

    render(
      <MemoryRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('K')).toBeInTheDocument();
      expect(screen.getByText('Kasun Perera')).toBeInTheDocument();
    });
  });

  it('toggles mobile navigation drawer on hamburger button click', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </MemoryRouter>
    );

    const mobileToggleBtn = screen.getByRole('button', { name: /navigation menu/i });
    expect(mobileToggleBtn).toBeInTheDocument();

    // Mobile menu drawer should initially be closed
    expect(screen.queryByPlaceholderText('Search rooms, locations, flatmates...')).not.toBeInTheDocument();

    // Click to open mobile drawer
    fireEvent.click(mobileToggleBtn);
    expect(screen.getByPlaceholderText('Search rooms, locations, flatmates...')).toBeInTheDocument();
    expect(screen.getByText('Chat Messages')).toBeInTheDocument();

    // Click to close
    fireEvent.click(mobileToggleBtn);
    expect(screen.queryByPlaceholderText('Search rooms, locations, flatmates...')).not.toBeInTheDocument();
  });

  it('submits desktop search form with keyword', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search rooms, locations, roommates/i);
    fireEvent.change(searchInput, { target: { value: 'Moratuwa' } });
    expect(searchInput.value).toBe('Moratuwa');

    // Submit search form
    const searchForm = searchInput.closest('form');
    fireEvent.submit(searchForm);
  });
});
