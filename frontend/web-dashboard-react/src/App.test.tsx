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
    expect(screen.getByRole('link', { name: /Enter Clinic OS/i })).toHaveAttribute('href', '/dashboard');
  });
});

describe('Dashboard', () => {
  test('renders operations, queue, and doctor context', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Live Operations')).toBeInTheDocument();
    expect(screen.getByText('Current Queue')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText(/Dr. Sarah Cole/i)).toBeInTheDocument();
  });
});
