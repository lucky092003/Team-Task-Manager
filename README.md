# Team Task Manager

Simple app to manage projects and tasks.

## Features

- Signup and login
- Admin and member roles
- Projects with members
- Tasks with status, priority, due date
- Dashboard with totals and overdue tasks

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB

## Run

1. Install

```bash
cd server
npm install

cd ../client
npm install
```

2. Set env files

- server/.env: MONGO_URI, JWT_SECRET, PORT, CLIENT_URL
- client/.env: VITE_API_URL

3. Start

```bash
cd server
node server.js

cd ../client
npm run dev
```

## Deploy

- Use render.yaml for Render deployment
- Or deploy server and client separately
- Check backend health at /api/health
