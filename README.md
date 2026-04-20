# TaskFlow 🗂️

> A full-stack - Task Management System — organize your work with boards, lists, and tasks.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Data Models](#-data-models)
- [Authentication Flow](#-authentication-flow)
- [Authorization Levels](#-authorization-levels)
- [Error Handling](#-error-handling)

---

## 🧭 Overview

TaskFlow is a full-stack task management platform . Users can create **boards**, organize work into **lists**, and manage **tasks** with statuses, due dates, comments, and activity logs.

The project is structured as a **monorepo** with a shared root `package.json` that runs both the backend and frontend concurrently with a single command.

```bash
npm run dev
```

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js 18+ | Runtime |
| Express 5 | Web framework |
| MongoDB Atlas | Database |
| Mongoose 9 | ODM |
| JSON Web Token | Authentication |
| bcryptjs | Password hashing |
| express-validator | Input validation |
| cookie-parser | Refresh token cookie |
| morgan | HTTP request logging |
| dotenv | Environment config |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI library |
| Vite 5 | Build tool & dev server |
| React Router | Client-side routing |
| Context API | Global state (auth, theme, toast) |
| Fetch API | HTTP requests |

---

## 📁 Project Structure

```
task-management-system/
├── task_management_system/          ← Backend (Node.js + Express)
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── board.controller.js
│   │   ├── list.controller.js
│   │   ├── task.controller.js
│   │   └── user.controller.js
│   ├── middlewares/
│   │   ├── authMW.js                ← JWT verification
│   │   ├── authorizMW.js            ← role & ownership checks
│   │   ├── errorHandlingMW.js       ← global error handler
│   │   └── notFoundMW.js            ← 404 handler
│   ├── models/
│   │   ├── user.js
│   │   ├── board.js
│   │   ├── list.js
│   │   ├── task.js                  ← embedded comments & activity
│   │   └── refreshToken.js
│   ├── routes/
│   │   ├── auth.router.js
│   │   ├── user.router.js
│   │   ├── board.router.js
│   │   ├── list.router.js           ← /boards/:boardId/lists
│   │   └── task.router.js           ← /boards/:boardId/lists/:id/tasks
│   ├── validations/
│   │   ├── userValidators.js
│   │   ├── boardValidators.js
│   │   ├── listValidators.js
│   │   ├── taskValidators.js
│   │   ├── paginationValidators.js
│   │   ├── validateMongoID.js
│   │   └── validateResults.js
│   ├── utils/
│   │   └── httpError.js
│   ├── app.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend_react/                  ← Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx        ← boards list
│   │   │   ├── BoardDetail.jsx      ← lists + tasks
│   │   │   └── Profile.jsx
│   │   ├── apiClient.js             ← fetchWithAuth + all API calls
│   │   ├── AuthContext.jsx          ← global auth state
│   │   ├── ThemeContext.jsx         ← dark/light mode
│   │   ├── ToastContext.jsx         ← toast notifications
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
│
├── .gitignore
├── package.json                     ← root: runs both concurrently
├── package-lock.json
└── README.md
```

---

## ✨ Features

### 🔐 Authentication
- Register with name, email, and password
- Login returns a short-lived **access token** (15 min)
- **Refresh token** stored in httpOnly cookie (7 days)
- Automatic token refresh on 401 responses
- Secure logout clears both tokens

### 📋 Boards
- Create, update, and delete boards
- Add and remove team members
- Only the board owner can delete or manage members

### 📝 Lists
- Create lists inside any board
- Rename and delete lists
- Auto-ordered by position

### ✅ Tasks
- Create tasks with title, description, due date, assignee
- Change status: `To Do` → `In Progress` → `Done`
- Assign tasks to board members
- Filter tasks by status
- Past-due dates highlighted in red

### 💬 Comments
- Add and delete comments on any task
- Only comment owner or admin can delete

### 📊 Activity Log
- Every task action is automatically recorded
- Logs: created, status changed, assigned, comment added

### 🌙 Dark Mode
- Toggle between light and dark themes
- Preference saved to `localStorage`

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **v18 or higher**
- [npm](https://www.npmjs.com/) **v9 or higher**
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) account

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/task-management-system.git
cd task-management-system
```

---

### 2. Install All Dependencies

```bash
# Root dependencies (concurrently)
npm install

# Backend dependencies
cd task_management_system
npm install
cd ..

# Frontend dependencies
cd frontend_react
npm install
cd ..
```

---

### 3. Configure Environment Variables

```bash
cd task_management_system
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=4000
MONGODB_URL=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/taskflow?retryWrites=true&w=majority
NODE_ENV=development

JWT_ACCESS_TOKEN_SECRET=your_access_secret_here
JWT_ACCESS_TOKEN_EXP=15m

JWT_REFRESH_TOKEN_SECRET=your_refresh_secret_here
JWT_REFRESH_TOKEN_EXP=7d
```

> 💡 Get your `MONGODB_URL` from MongoDB Atlas → Connect → Drivers → Node.js

---

### 4. Run the Project

From the **root folder**:

```bash
npm run dev
```

This starts both servers simultaneously:

| Service | URL |
|---------|-----|
| Backend API | http://localhost:3000 |
| Frontend App | http://localhost:5173 |

---

### Expected Output

```bash
[0] ✅ connected to database
[0] 🚀 server is running on port 3000
[1]   VITE v5.x.x  ready
[1]   ➜  Local:   http://localhost:5173/
```

---

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `3000` |
| `MONGODB_URL` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `NODE_ENV` | Environment | `development` |
| `JWT_ACCESS_TOKEN_SECRET` | Secret key for access tokens | any long random string |
| `JWT_ACCESS_TOKEN_EXP` | Access token expiry | `15m` |
| `JWT_REFRESH_TOKEN_SECRET` | Secret key for refresh tokens | any long random string |
| `JWT_REFRESH_TOKEN_EXP` | Refresh token expiry | `7d` |

---

## 📡 API Reference

### Auth — `/api/auth`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/registration` | Register new account | Public |
| POST | `/login` | Login → returns `accessToken` | Public |
| POST | `/logout` | Logout + clear refresh token | Public |
| POST | `/refresh` | Get new access token | Public |

### Users — `/api/users`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all users | Admin |
| GET | `/:id` | Get user by ID | ✅ |
| PATCH | `/:id` | Update name or email | ✅ |
| PATCH | `/:id/password` | Update password | ✅ |
| DELETE | `/:id` | Delete user | Admin |

### Boards — `/api/boards`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all my boards | ✅ |
| POST | `/` | Create board | ✅ |
| GET | `/:id` | Get board details | Member |
| PATCH | `/:id` | Update board | Owner |
| DELETE | `/:id` | Delete board | Owner/Admin |
| POST | `/:id/members` | Add member | Owner |
| DELETE | `/:id/members/:userId` | Remove member | Owner |

### Lists — `/api/boards/:boardId/lists`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all lists | Member |
| POST | `/` | Create list | Member |
| PATCH | `/:id` | Update list | Member |
| DELETE | `/:id` | Delete list | Owner/Admin |

### Tasks — `/api/boards/:boardId/lists/:listId/tasks`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get tasks (filterable) | Member |
| POST | `/` | Create task | Member |
| GET | `/:taskId` | Get task details | Member |
| PATCH | `/:taskId` | Update task | Member |
| DELETE | `/:taskId` | Delete task | Owner/Admin |
| PATCH | `/:taskId/status` | Update status | Member |
| POST | `/:taskId/assign` | Assign to user | Member |
| POST | `/:taskId/comments` | Add comment | Member |
| PATCH | `/:taskId/comments/:cId` | Update comment | Comment Owner/Admin |
| DELETE | `/:taskId/comments/:cId` | Delete comment | Comment Owner/Admin |

**Query filters:**
```
GET /tasks?status=todo&assignedTo=userId&dueDate=2025-12-31&page=1&limit=10
```

---

## 🗃 Data Models

### User
```js
{ name, email, password, role: "admin"|"user" }
```

### Board
```js
{ title, description, owner: ObjectId, members: [ObjectId] }
```

### List
```js
{ title, order, board: ObjectId }
```

### Task
```js
{
  title, description,
  status: "todo"|"inProgress"|"done",
  dueDate, list: ObjectId, assignedTo: ObjectId,
  comments: [{ content, user, createdAt }],
  activity: [{ action, user, createdAt }]
}
```

---

## 🔑 Authentication Flow

```
Register  →  POST /api/auth/registration
Login     →  POST /api/auth/login  →  accessToken (JSON) + refreshToken (cookie)
Request   →  Authorization: Bearer <accessToken>
Expired   →  POST /api/auth/refresh  →  new accessToken (auto via fetchWithAuth)
Logout    →  POST /api/auth/logout   →  clears DB token + cookie
```

---

## 🛡 Authorization Levels

| Level | Who | Example |
|-------|-----|---------|
| Public | Everyone | Register, Login |
| Auth | Any logged-in user | Create board |
| Member | Board owner or member | Create tasks |
| Owner | Board creator | Delete board |
| Admin | `role: "admin"` | Delete any resource |
| Comment Owner | Comment author | Delete own comment |

---

## ⚠️ Error Handling

```json
{
  "status": "error",
  "message": "validation error",
  "errors": [
    { "field": "email", "message": "Not a valid email" }
  ]
}
```

| Code | Meaning |
|------|---------|
| `400` | Validation error |
| `401` | Not authenticated |
| `403` | Not authorized |
| `404` | Not found |
| `500` | Server error |

