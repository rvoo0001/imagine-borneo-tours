# Imagine Borneo Tours

A full-stack wildlife tour catalogue for exploring Borneo experiences, comparing tours, and maintaining content through protected administration.

## Stack

React 19, TypeScript, TanStack Router/Query/Start, Tailwind CSS, Vite, FastAPI, Pydantic, SQLAlchemy and PostgreSQL. Isolated SQLite databases support local testing.

## Features

- Tour search with wildlife and price filters
- Tour details, image galleries and wildlife sighting probabilities
- Wildlife catalogue, About page and enquiry form
- Admin tour/animal editors and image management

Content management, visitor preview, regression coverage and CI/CD are being completed against the [QA plan](docs/QA_PLAN.md). The [initial audit](FRONTEND_AUDIT_2026-10-10.md) records the starting defects, not the final status.

## Development

Requirements: Node 22.12+ and Python 3.11+.

```sh
python -m venv backend/.venv
# Activate the virtual environment for your shell.
python -m pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
# Set unique local admin credentials in backend/.env.
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8002
```

In another terminal:

```sh
cd frontend/tanstack_frontend
npm ci
npm run dev
```

The baseline frontend still points at port 8000; configurable routing is the next repair. Avoid another application's port.

## Quality checks

```sh
cd frontend/tanstack_frontend
npx tsc --noEmit
npm run lint
npm test
npm run build
```

## Public source and runtime data

This repository starts with a sanitized snapshot. Legacy GitLab history remains local because it contained development credentials. Environment files, databases, runtime uploads, dependencies and builds are excluded. Supply your own licensed imagery; catalogue uploads are not distributed with the source. Never reuse old development credentials for deployment.

Custom-domain configuration is deferred. No production deployment is claimed yet.
