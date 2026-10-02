import { useEffect, useMemo, useState } from 'react';

type Account = {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
  color: string;
};

type Transaction = {
  id: string;
  title: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  accountId: string;
};

type Budget = {
  category: string;
  used: number;
  limit: number;
  color: string;
};







const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});


export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token') || null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<any>({});
  
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [loginEmail, setLoginEmail] = useState('');
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [form, setForm] = useState<any>({ title: '', amount: '', type: 'expense', category: 'Food', accountId: '', date: '' });
  const [loginPassword, setLoginPassword] = useState('');

  const fetchDashboard = async (overrideToken?: string) => {
    const activeToken = overrideToken || token;
    if (!activeToken) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (!res.ok) {
        if (res.status === 401) handleLogout();
        throw new Error('Failed to load dashboard');
      }
      const data = await res.json();
      setTransactions(data.transactions || []);
      setAccounts(data.accounts || []);
      setBudgets(data.budgets || []);
      setSummary(data.summary || {});
      if (data.accounts?.length > 0 && !selectedAccount) {
        setSelectedAccount(data.accounts[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboard();
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      
      setTransactions(data.dashboard.transactions || []);
      setAccounts(data.dashboard.accounts || []);
      setBudgets(data.dashboard.budgets || []);
      setSummary(data.dashboard.summary || {});
      if (data.dashboard.accounts?.length > 0) {
        setSelectedAccount(data.dashboard.accounts[0].id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: data.get('title'),
          amount: Number(data.get('amount')),
          type: data.get('type'),
          category: data.get('category'),
          accountId: data.get('accountId'),
          date: data.get('date')
        })
      });
      if (res.ok) {
        form.reset();
        fetchDashboard();
      }
    } catch(err) {
      console.error(err);
    }
  };

  return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-lg flex items-center justify-center mx-auto mb-4 text-xl font-bold">L</div>
            <h1 className="text-2xl font-bold text-slate-900">LedgerLite</h1>
            <p className="text-slate-500 mt-2">Sign in to your personal finance dashboard.</p>
          </div>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600" required />
            </div>
            <button disabled={loading} className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <div className="text-sm text-center text-slate-500 pt-4">
              <p>Demo Account: <br /><b>demo@waleed.dev</b> / <b>Demo@1234</b></p>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">About this project</h3>
              <p className="text-sm text-slate-600 mb-3">A full-stack personal finance dashboard (Vite + Express). Features secure JWT auth, real-time balance calculations, and categorized spending history.</p>
              <div className="flex gap-3 text-sm">
                <a href="https://github.com/Waleed-Ilyas/ledgerlite" className="text-indigo-600 hover:underline">GitHub</a>
                <a href="/work/ledgerlite" className="text-indigo-600 hover:underline">Case Study</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeAccounts = useMemo(() => accounts, [accounts]);


  const totalBalance = activeAccounts.reduce((sum, account) => sum + account.balance, 0);
  const monthlyIncome = transactions.filter((t) => t.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const monthlyExpenses = transactions.filter((t) => t.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const savingsRate = monthlyIncome ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  const accountTransactions = transactions.filter((tx) => tx.accountId === selectedAccount);
  const categoryTotals = useMemo(() => {
    return Object.entries(
      accountTransactions
        .filter((tx) => tx.type === 'expense')
        .reduce<Record<string, number>>((totals, tx) => {
          totals[tx.category] = (totals[tx.category] ?? 0) + tx.amount;
          return totals;
        }, {})
    )
      .sort(([, current], [, next]) => next - current)
      .slice(0, 4);
  }, [accountTransactions]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      type: form.type,
      amount,
      date: form.date,
      accountId: selectedAccount,
    };

    setTransactions((current) => [newTx, ...current]);
    setForm({
      title: '',
      category: 'Food',
      type: 'expense',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
    });
    setShowNewEntry(true);
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <span style={styles.kicker}>Finance Workspace</span>
          <h1 style={styles.title}>LedgerLite</h1>
        </div>
        <button style={styles.primaryButton} onClick={() => setShowNewEntry((v) => !v)}>
          {showNewEntry ? 'Hide entry' : 'Add transaction'}
        </button>
      </header>

      <section style={styles.summaryGrid}>
        <SummaryCard label="Net worth" value={money.format(totalBalance)} accent="#7c9cff" />
        <SummaryCard label="Monthly income" value={money.format(monthlyIncome)} accent="#3dd9b3" />
        <SummaryCard label="Monthly spend" value={money.format(monthlyExpenses)} accent="#ffb454" />
        <SummaryCard label="Savings rate" value={`${savingsRate.toFixed(1)}%`} accent="#f87171" />
      </section>

      {showNewEntry && (
        <form onSubmit={handleSubmit} style={styles.formCard}>
          <div style={styles.formGrid}>
            <label style={styles.label}>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={styles.input} /></label>
            <label style={styles.label}>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={styles.input}><option>Food</option><option>Housing</option><option>Travel</option><option>Utilities</option><option>Salary</option><option>Contract</option><option>Health</option></select></label>
            <label style={styles.label}>Type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'income' | 'expense' })} style={styles.input}><option value="expense">Expense</option><option value="income">Income</option></select></label>
            <label style={styles.label}>Amount<input type="number" value={form.amount} min="0.01" step="0.01" onChange={(e) => setForm({ ...form, amount: e.target.value })} style={styles.input} /></label>
            <label style={styles.label}>Date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={styles.input} /></label>
          </div>
          <div style={styles.formActions}><button type="submit" style={styles.primaryButton}>Save entry</button></div>
        </form>
      )}

      <section style={styles.contentGrid}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.sectionTitle}>Accounts</h2>
          </div>
          <div style={styles.accountList}>
            {activeAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => setSelectedAccount(account.id)}
                style={{
                  ...styles.accountCard,
                  ...(selectedAccount === account.id ? styles.accountCardActive : {}),
                  borderLeft: `4px solid ${account.color}`,
                }}
              >
                <div style={styles.accountMeta}>
                  <span>{account.name}</span>
                  <span style={styles.accountType}>{account.type}</span>
                </div>
                <strong>{money.format(account.balance)}</strong>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.sectionTitle}>Budget snapshot</h2>
          </div>
          <div style={styles.budgetList}>
            {budgets.map((budget) => {
              const pct = Math.min((budget.used / budget.limit) * 100, 100);
              return (
                <div key={budget.category} style={styles.budgetItem}>
                  <div style={styles.budgetLabelRow}>
                    <span>{budget.category}</span>
                    <span>{money.format(budget.used)} / {money.format(budget.limit)}</span>
                  </div>
                  <div style={styles.progressTrack}>
                    <div style={{ ...styles.progressFill, width: `${pct}%`, background: budget.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ ...styles.categorySection, marginTop: 20 }}>
            <div style={styles.panelHeader}>
              <h3 style={styles.sectionTitle}>Spending mix</h3>
            </div>
            <div style={styles.budgetList}>
              {categoryTotals.length > 0 ? (
                categoryTotals.map(([category, amount]) => (
                  <div key={category} style={styles.budgetItem}>
                    <div style={styles.budgetLabelRow}>
                      <span>{category}</span>
                      <span>{money.format(amount)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={styles.emptyText}>No expense entries yet for this account.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <h2 style={styles.sectionTitle}>Recent activity</h2>
          <span style={styles.badge}>{accountTransactions.length} entries</span>
        </div>
        <div style={styles.transactionList}>
          {accountTransactions.slice(0, 6).map((tx) => (
            <div key={tx.id} style={styles.transactionItem}>
              <div>
                <div style={styles.transactionTitle}>{tx.title}</div>
                <div style={styles.transactionMeta}>{tx.category} • {tx.date}</div>
              </div>
              <span style={{ ...styles.amount, color: tx.type === 'income' ? '#3dd9b3' : '#fbbf24' }}>
                {tx.type === 'income' ? '+' : '-'}{money.format(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ ...styles.summaryCard, borderTop: `4px solid ${accent}` }}>
      <span style={styles.summaryLabel}>{label}</span>
      <strong style={styles.summaryValue}>{value}</strong>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    padding: '32px 24px 48px',
    background: 'rgba(9,17,29,0.94)',
    color: '#edf3ff',
  },
  header: {
    maxWidth: 1200,
    margin: '0 auto 22px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  kicker: {
    display: 'inline-block',
    fontSize: 12,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#9bb0ff',
    marginBottom: 8,
  },
  title: {
    margin: 0,
    fontSize: 'clamp(2rem, 4vw, 3.5rem)',
    lineHeight: 1.1,
  },
  primaryButton: {
    border: 'none',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #7c9cff 0%, #3dd9b3 100%)',
    color: '#08131f',
    fontWeight: 700,
    padding: '0.8rem 1.1rem',
    cursor: 'pointer',
    boxShadow: '0 12px 30px rgba(124, 156, 255, 0.25)',
  },
  summaryGrid: {
    maxWidth: 1200,
    margin: '0 auto 24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 18,
  },
  summaryCard: {
    background: 'rgba(16, 25, 38, 0.9)',
    borderRadius: 16,
    padding: '18px 20px',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    boxShadow: '0 18px 40px rgba(2, 6, 23, 0.38)',
  },
  summaryLabel: {
    display: 'block',
    color: '#aab6d3',
    fontSize: 12,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 'clamp(1.3rem, 3vw, 2.1rem)',
  },
  formCard: {
    maxWidth: 1200,
    margin: '0 auto 24px',
    background: 'rgba(16, 25, 38, 0.9)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: 18,
    padding: 20,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    fontSize: 13,
    color: '#cbd5e1',
  },
  input: {
    background: '#0b1320',
    border: '1px solid rgba(148,163,184,0.25)',
    borderRadius: 10,
    padding: '10px 12px',
    color: '#edf3ff',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 18,
  },
  contentGrid: {
    maxWidth: 1200,
    margin: '0 auto 24px',
    display: 'grid',
    gridTemplateColumns: '1.1fr 1fr',
    gap: 18,
  },
  panel: {
    maxWidth: 1200,
    margin: '0 auto 24px',
    background: 'rgba(16, 25, 38, 0.9)',
    borderRadius: 18,
    padding: 20,
    border: '1px solid rgba(148, 163, 184, 0.18)',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.1rem',
  },
  accountList: {
    display: 'grid',
    gap: 12,
  },
  accountCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#0b1320',
    border: '1px solid rgba(148,163,184,0.20)',
    borderRadius: 14,
    padding: '14px 16px',
    cursor: 'pointer',
    color: '#edf3ff',
    textAlign: 'left',
  },
  accountCardActive: {
    background: 'rgba(124, 156, 255, 0.08)',
    borderColor: 'rgba(124, 156, 255, 0.7)',
  },
  accountMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    color: '#b9c7e3',
    fontSize: 13,
  },
  accountType: {
    textTransform: 'capitalize',
  },
  budgetList: {
    display: 'grid',
    gap: 16,
  },
  budgetItem: {
    display: 'grid',
    gap: 8,
  },
  budgetLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    color: '#d9e5ff',
    fontSize: 14,
  },
  progressTrack: {
    position: 'relative',
    height: 10,
    borderRadius: 999,
    background: 'rgba(148, 163, 184, 0.18)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  badge: {
    background: 'rgba(124, 156, 255, 0.15)',
    color: '#c7d5ff',
    border: '1px solid rgba(124, 156, 255, 0.45)',
    borderRadius: 999,
    padding: '6px 10px',
    fontSize: 12,
  },
  categorySection: {
    borderTop: '1px solid rgba(148,163,184,0.18)',
    paddingTop: 18,
  },
  emptyText: {
    color: '#9aa9c5',
    margin: 0,
    fontSize: 14,
  },
  transactionList: {
    display: 'grid',
    gap: 12,
  },
  transactionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    background: '#0b1320',
    border: '1px solid rgba(148,163,184,0.18)',
    borderRadius: 14,
    padding: '14px 16px',
  },
  transactionTitle: {
    fontWeight: 700,
    marginBottom: 4,
  },
  transactionMeta: {
    fontSize: 12,
    color: '#9aa9c5',
  },
  amount: {
    fontWeight: 700,
    fontSize: 14,
  },
};
