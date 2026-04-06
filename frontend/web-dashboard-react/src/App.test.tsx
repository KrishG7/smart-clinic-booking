import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';

import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';

describe('LandingPage', () => {
  test('renders the hero content and dashboard CTA', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Eliminate Waiting/i)).toBeInTheDocument();
    expect(screen.getByText(/Clinic OS 2.0 is Live/i)).toBeInTheDocument();
    // CTA routes to /login (auth gateway before dashboard)
    expect(screen.getByRole('link', { name: /Enter Clinic OS/i })).toHaveAttribute('href', '/login');
  });
});

describe('Dashboard', () => {
  test('renders loading state when no auth token is present', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Without auth, Dashboard shows a loading spinner while fetching user
    expect(screen.getByText(/Connecting to Clinic OS/i)).toBeInTheDocument();
  });
});
