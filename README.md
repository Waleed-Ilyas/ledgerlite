# LedgerLite

LedgerLite is a lightweight personal finance dashboard for tracking spending, recurring costs, monthly budgets, and cash flow trends. It is a personal project designed to feel like a clean, simple budgeting app without pretending to be a full financial SaaS.

## Features
- Personal dashboard with income, expenses, and savings summary
- Transaction list with category tagging and filtering by account
- Budget tracking by category with visible progress states
- Spending mix view to surface the largest expense categories quickly
- Demo data for local UI and workflow iteration

## Tech stack
- React + Vite
- Express + Node.js
- In-memory mock data layer for local iteration
- Vitest for automated checks

## Demo accounts
- demo@waleed.dev / Demo@1234
- admin@waleed.dev / Admin@1234

## Getting started
```bash
cd projects/ledgerlite
pnpm install
pnpm dev
```

Then open the client at `http://localhost:5173` and the API at `http://localhost:4000`.

## Validation
```bash
pnpm test
pnpm build
```

## What I'd improve next
- Replace in-memory data with Postgres or MongoDB persistence
- Add recurring transaction automation and monthly forecasting
- Add CSV import and multi-account support
- Create proper auth sessions and user isolation

## Author
Waleed Ilyas
