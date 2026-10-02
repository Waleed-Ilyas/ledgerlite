import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import App from './App';

describe('LedgerLite app', () => {
  it('renders the login screen when unauthenticated', () => {
    localStorage.removeItem('token');
    render(<App />);

    expect(screen.getByText(/LedgerLite/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/About this project/i)).toBeInTheDocument();
  });
});
