<!-- Personal info: replace with your name/contact -->
## Personal

Name: Samuel Reyes Castro

Contact: https://github.com/reyesuwu461


# TechNova Dashboard

TechNova is a demo single-page app for a tech retailer (laptops, monitors, peripherals and accessories). Built with Vite, React and React Router 6. Includes a mocked API (MSW) for local development, Storybook stories and Playwright tests.

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
- `src/routes/` — route components (login, register, products, etc.)
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

Serve production build with Express

After running a production build, an Express server is provided at `server/index.js` to serve the `dist` folder.

Build and run (recommended for production-like testing):

```bash
# install deps (if not already)
npm install

# build the app and start the Express server
npm run start

# or if you already built, run just the server
npm run preview
```

The server listens by default on port 5173. To change it, set `PORT`:

```bash
PORT=8080 npm run preview
```

Notes

- The project keeps using Vite for development (HMR, dev tooling) and for creating production builds. Express is used only to serve the built static files. This keeps the fast dev experience while providing a simple production server.
- If you want, I can add gzip compression, security headers (helmet), a Dockerfile, or a PM2 service file for production deployment — dime cuál quieres y lo añado.

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
