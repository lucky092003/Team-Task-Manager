# Team Task Manager

The Team Task Manager is a simple full-stack web application designed to help teams manage their projects and tasks efficiently. It provides a centralized platform where users can create projects, assign tasks to team members, and track the progress of work in real time.

The system includes user authentication to ensure secure access. Admin users can create and manage projects, while team members can view and update their assigned tasks. Each task has a status such as Pending, In Progress, or Completed, making it easy to monitor overall progress.

This application improves productivity and collaboration by keeping all project-related information organized in one place, allowing team members to stay updated with their responsibilities and deadlines.

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
