const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const users = [
  {
    id: 'user-demo',
    name: 'Demo User',
    email: 'demo@waleed.dev',
    password: 'Demo@1234',
    role: 'member',
  },
  {
    id: 'user-admin',
    name: 'Admin User',
    email: 'admin@waleed.dev',
    password: 'Admin@1234',
    role: 'admin',
  },
];

const accounts = [
  { id: 'acc-checking', name: 'Primary Checking', type: 'checking', balance: 12840.32, currency: 'USD', color: '#7c9cff' },
  { id: 'acc-savings', name: 'Emergency Fund', type: 'savings', balance: 24500, currency: 'USD', color: '#3dd9b3' },
  { id: 'acc-credit', name: 'Travel Card', type: 'credit', balance: -682.4, currency: 'USD', color: '#ffb454' },
];

const budgets = [
  { category: 'Housing', used: 1825, limit: 2200, color: '#7c9cff' },
  { category: 'Food', used: 1184, limit: 1600, color: '#3dd9b3' },
  { category: 'Travel', used: 640, limit: 900, color: '#ffb454' },
  { category: 'Utilities', used: 402, limit: 550, color: '#f87171' },
];

const transactions = [
  { id: 'tx-1', title: 'Paycheck', category: 'Salary', type: 'income', amount: 4200, date: '2025-04-02', accountId: 'acc-checking' },
  { id: 'tx-2', title: 'Rent', category: 'Housing', type: 'expense', amount: 1825, date: '2025-04-03', accountId: 'acc-checking' },
  { id: 'tx-3', title: 'Groceries', category: 'Food', type: 'expense', amount: 284.12, date: '2025-04-05', accountId: 'acc-checking' },
  { id: 'tx-4', title: 'Freelance Client', category: 'Contract', type: 'income', amount: 960, date: '2025-04-08', accountId: 'acc-savings' },
  { id: 'tx-5', title: 'Flight Booking', category: 'Travel', type: 'expense', amount: 640, date: '2025-04-09', accountId: 'acc-credit' },
  { id: 'tx-6', title: 'Gym Membership', category: 'Health', type: 'expense', amount: 78.5, date: '2025-04-11', accountId: 'acc-checking' },
];

function sanitizeUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function getAuthUser(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;

  const matchingUser = users.find((user) => user.id === token);
  return matchingUser || null;
}

function buildDashboard() {
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const income = transactions.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = transactions.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);

  return {
    summary: {
      totalBalance,
      monthlyIncome: income,
      monthlyExpenses: expenses,
      savingsRate: income ? ((income - expenses) / income) * 100 : 0,
    },
    accounts,
    budgets,
    transactions: [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)),
  };
}

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ledgerlite' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((candidate) => candidate.email === email && candidate.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  return res.json({
    token: user.id,
    user: sanitizeUser(user),
    dashboard: buildDashboard(),
  });
});

app.get('/api/dashboard', (req, res) => {
  const user = getAuthUser(req);

  if (!user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  return res.json({
    user: sanitizeUser(user),
    ...buildDashboard(),
  });
});

app.post('/api/transactions', (req, res) => {
  const user = getAuthUser(req);

  if (!user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const { title, category, type, amount, date, accountId } = req.body || {};

  if (!title || !category || !type || !amount || !date || !accountId) {
    return res.status(400).json({ message: 'Missing required transaction fields.' });
  }

  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ message: 'Transaction type must be income or expense.' });
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero.' });
  }

  const nextTransaction = {
    id: `tx-${Date.now()}`,
    title: String(title).trim(),
    category: String(category).trim(),
    type,
    amount: parsedAmount,
    date: String(date),
    accountId: String(accountId),
  };

  transactions.unshift(nextTransaction);

  return res.status(201).json({ transaction: nextTransaction, dashboard: buildDashboard() });
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LedgerLite API running on http://localhost:${PORT}`);
  });
}

module.exports = { app, accounts, budgets, transactions, users, buildDashboard };
