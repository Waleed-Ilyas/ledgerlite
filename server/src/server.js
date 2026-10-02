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


const transactions = [];
let txId = 1;
const today = new Date();
for(let m = 0; m < 6; m++) {
  const monthDate = new Date(today.getFullYear(), today.getMonth() - m, 15);
  // Salary
  transactions.push({ id: 'tx-s-'+m, title: 'Paycheck', category: 'Salary', type: 'income', amount: 4200, date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 2).toISOString().split('T')[0], accountId: 'acc-checking' });
  // Rent
  transactions.push({ id: 'tx-r-'+m, title: 'Rent', category: 'Housing', type: 'expense', amount: 1825, date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 3).toISOString().split('T')[0], accountId: 'acc-checking' });
  // Groceries (multiple)
  transactions.push({ id: 'tx-g1-'+m, title: 'Groceries', category: 'Food', type: 'expense', amount: 284.12, date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5).toISOString().split('T')[0], accountId: 'acc-checking' });
  transactions.push({ id: 'tx-g2-'+m, title: 'Groceries', category: 'Food', type: 'expense', amount: 156.40, date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 15).toISOString().split('T')[0], accountId: 'acc-checking' });
  // Utilities
  transactions.push({ id: 'tx-u-'+m, title: 'Electricity', category: 'Utilities', type: 'expense', amount: 124.50, date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 12).toISOString().split('T')[0], accountId: 'acc-checking' });
  // Dining Out
  transactions.push({ id: 'tx-d-'+m, title: 'Restaurant', category: 'Food', type: 'expense', amount: 85.00, date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 20).toISOString().split('T')[0], accountId: 'acc-credit' });
  // Freelance
  if(m % 2 === 0) {
    transactions.push({ id: 'tx-f-'+m, title: 'Freelance Client', category: 'Contract', type: 'income', amount: 960, date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 8).toISOString().split('T')[0], accountId: 'acc-savings' });
  }
}


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
