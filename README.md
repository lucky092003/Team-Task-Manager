# Team Task Manager
The Team Task Manager is a full-stack web application designed to streamline project and task management within a team. It enables users to create and manage projects, assign tasks to team members, and monitor progress efficiently through a centralized dashboard.

The application implements secure user authentication (Signup/Login) along with role-based access control, where Admins can create projects, manage teams, and assign tasks, while Members can view and update their assigned tasks.

It provides essential features such as task status tracking (To-Do, In Progress, Completed), overdue task monitoring, and project-wise organization, helping teams stay productive and organized.

This project is built using modern web technologies with a RESTful API architecture, a structured database (SQL/NoSQL), proper validations, and well-defined relationships between users, projects, and tasks. The application is fully deployed, making it accessible and usable in a real-world environment.

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
npm run dev

cd ../client
npm run dev
```

## Deploy

- Use render.yaml for Render deployment
- Or deploy server and client separately
- Check backend health at /api/health


