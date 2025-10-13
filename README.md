<!-- Personal info: replace with your name/contact -->
## Personal

Name: Samuel Reyes Castro

Contact: https://github.com/reyesuwu461


# vite-spa

Lightweight single-page app built with Vite, React, and React Router 6. Useful as a demo or starter for a small dashboard-style SPA. Includes a mocked API (MSW) for local development, Storybook stories, and Playwright tests.

Table of Contents

- [Quickstart (Ubuntu / Linux)](#quickstart-ubuntu--linux)
- [Project structure](#project-structure)
- [Development notes](#development-notes)
- [Testing](#testing)
- [Common issues](#common-issues)
- [Contributing](#contributing)

Project structure

- `index.html` — app entry
- `src/main.tsx` — app bootstrap and router
- `src/routes/` — route components (login, register, vehicles, etc.)
- `src/components/` — reusable UI components
- `src/mocks/` — MSW handlers & setup used in dev
- `public/` — static assets (mock service worker)
- `tests/` — Playwright tests

Quickstart — Ubuntu / Linux

Prerequisites

- Node.js (18+ recommended)
- Git

Install Node (NodeSource example):

```bash
sudo apt update
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

Clone and run

```bash
git clone https://github.com/reyesuwu461/vite-spa.git
cd vite-spa
npm install
VITE_MSW=true npm run dev
```

Open http://localhost:5173 in your browser.

Development notes

- The dev server uses MSW (Mock Service Worker) when `VITE_MSW` is set to `true`.
- API client uses `ky` and automatically attaches the `Authorization` header from a cookie.

Testing

Run Playwright tests:

```bash
npm run test
```

Common issues

- If `npm install` is very slow, consider using `npm ci` or switching to `pnpm`.
- If Vite fails due to missing plugins, install them (e.g. `npm i -D @vitejs/plugin-react`).
- If your project is on OneDrive move it to a local folder (OneDrive can slow filesystem IO).

Contributing

- Open issues and PRs. Use feature branches and create PRs against `main`.

License

This project is provided as-is for learning/demo purposes.
