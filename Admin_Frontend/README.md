# FlipiBook Admin Console (Admin_Frontend)

A dedicated, high-performance administration, content moderation, and cluster telemetry console for FlipiBook.

## Features

- **Executive Dashboard**: Key platform telemetry (users, flipbooks, views, storage metrics, active sessions).
- **User Directory & Governance**: Role promotion/demotion (`user`, `admin`), account status toggles (`active`, `suspended`, `banned`), user deletion.
- **Flipbook Moderation**: Flipbook catalog inspection, flag content, feature showcase toggle, catalog deletion.
- **Forum Governance**: Manage community bug reports & feature requests, post official engineering replies, lock/unlock threads, pin announcements, and transition status (`open`, `under_review`, `resolved`, `closed`).
- **Cluster Telemetry Monitor**: Real-time heartbeat ping and latency checks across all 10 microservices and the API Gateway.
- **Administrative Audit Logs**: Immutable audit trail viewer for all admin operations with JSON payload inspection.

## Tech Stack

- **React 19**
- **React Router v7**
- **Tailwind CSS v4**
- **Lucide React** (icons)
- **Axios** (credentials enabled, no localStorage token dependence)
- **Vite** (Port 5174, proxies to Gateway on 8000)

## Quick Start

```bash
# In the repository root
npm run dev:admin

# Or inside Admin_Frontend
cd Admin_Frontend
npm run dev
```

Runs by default on **http://localhost:5174**.
