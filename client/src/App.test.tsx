import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import App from './App';

describe('LedgerLite app', () => {
  it('renders the main dashboard shell', () => {
    render(<App />);

    expect(screen.getByText(/LedgerLite/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add transaction/i })).toBeInTheDocument();
  });

  it('shows the spending mix for the selected account', () => {
    render(<App />);

    expect(screen.getByText(/spending mix/i)).toBeInTheDocument();
    expect(screen.getAllByText(/housing/i).length).toBeGreaterThan(0);
  });
});
