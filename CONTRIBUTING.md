# Contributing to Localdeck

Thanks for your interest in contributing!

## Getting started

```bash
# Clone and enter the repo
git clone https://github.com/manuamest/Localdeck.git
cd Localdeck

# Start the full stack
docker compose up --build
```

The frontend dev server proxies `/api` to the backend, so you can also run them separately:

```bash
# Backend
cd backend
uv sync
PYTHONPATH=. uvicorn app.main:app --reload --port 4888

# Frontend
cd frontend
npm install
npm run dev
```

## Running tests

```bash
# Backend (from backend/)
PYTHONPATH=. .venv/bin/pytest tests/ -q

# Frontend type-check
cd frontend && ./node_modules/.bin/tsc --noEmit
```

All tests must pass and TypeScript must compile clean before opening a PR.

## Making changes

1. Fork the repo and create a branch: `git checkout -b feature/your-idea`
2. Make your changes — keep diffs focused and minimal
3. Run the test suite and type-check
4. Open a pull request with a clear description of what and why

## Guidelines

- **Backend:** Python 3.12+, FastAPI, typed with mypy. Run `ruff check` before committing.
- **Frontend:** React 18 + TypeScript + Vite + Tailwind. No new runtime dependencies without discussion.
- **No database:** user preferences live in `localStorage`. Keep the backend stateless.
- **Privacy boundary:** the scanner must never probe non-local hosts.

## Reporting bugs

Open a GitHub issue with steps to reproduce, your OS, and the Docker/Python versions you're running.
