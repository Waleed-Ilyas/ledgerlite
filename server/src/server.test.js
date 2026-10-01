import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { app } from './server.js';

describe('LedgerLite server', () => {
  let server;

  beforeAll(async () => {
    server = app.listen(0);
  });

  afterAll(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it('authenticates the demo user', async () => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@waleed.dev', password: 'Demo@1234' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.user.email).toBe('demo@waleed.dev');
    expect(data.dashboard.summary.totalBalance).toBeGreaterThan(0);
  });

  it('returns a protected dashboard for authenticated users', async () => {
    const loginResponse = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@waleed.dev', password: 'Admin@1234' }),
    });
    const loginPayload = await loginResponse.json();

    const dashboardResponse = await fetch(`http://127.0.0.1:${server.address().port}/api/dashboard`, {
      headers: { Authorization: `Bearer ${loginPayload.token}` },
    });

    expect(dashboardResponse.status).toBe(200);
    const dashboard = await dashboardResponse.json();
    expect(dashboard.accounts.length).toBeGreaterThan(0);
    expect(dashboard.transactions.length).toBeGreaterThan(0);
  });

  it('creates a new expense transaction', async () => {
    const loginResponse = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@waleed.dev', password: 'Demo@1234' }),
    });
    const loginPayload = await loginResponse.json();

    const transactionResponse = await fetch(`http://127.0.0.1:${server.address().port}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginPayload.token}`,
      },
      body: JSON.stringify({
        title: 'Coffee',
        category: 'Food',
        type: 'expense',
        amount: 14.5,
        date: '2025-04-13',
        accountId: 'acc-checking',
      }),
    });

    expect(transactionResponse.status).toBe(201);
    const payload = await transactionResponse.json();
    expect(payload.transaction.title).toBe('Coffee');
    expect(payload.dashboard.transactions[0].title).toBe('Coffee');
  });
});
