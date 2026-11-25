# Lab 4: Secure Connect and Communication Platform

**Course:** Web Development III — Unit 4  
**Project:** Secure Connect and Communication Platform  
**Architecture:** Full-Stack Node.js, Express, MongoDB, JWT, bcrypt, Socket.IO, EventEmitter, and React (Vite + Tailwind CSS).

---

## 1. Project Overview

The **Secure Connect and Communication Platform** is a full-stack, secure web application built for the Web Development III Lab practical demonstration. It adheres strictly to the required assignment stack without relying on any third-party authentication boilerplates, starter kits, Passport.js, Firebase, Supabase, or external auth frameworks.

### Key Capabilities:
- **Authentication & Security:** Manual user registration with email uniqueness checks, password hashing using `bcrypt` (10 salt rounds), and stateless session authentication using `jsonwebtoken` (JWT).
- **Protected Routes & RBAC:** Custom middleware (`authMiddleware.js`) enforcing valid JWT token verification and returning `403 Forbidden` (`{"message": "No token provided"}`) when requests lack credentials.
- **Secure Personal Notes API (CRUD):** Fully isolated user notes stored in MongoDB via Mongoose. Users can create, read, update, and delete their own notes with strict ownership validation.
- **Real-Time Communication:** Bidirectional WebSocket chat rooms built using `Socket.IO`. Features connected user tracking, instant room broadcasting, timestamps, and console logging.
- **Event-Driven Architecture:** Decoupled event logging implemented with Node.js built-in `EventEmitter` (`userRegistered`, `userLoggedIn`, `noteCreated`, `noteUpdated`, `noteDeleted`, `chatMessage`).
- **Modern SaaS Dashboard:** Modern React 19 UI with Vite and Tailwind CSS featuring a responsive sidebar, overview cards, personal notes management with search & modals, real-time chat room, live event stream, and profile security view.

---

## 2. Technology Stack

### Backend (Strict Compliance):
- **Runtime:** Node.js (v24.x / LTS)
- **Web Framework:** Express.js (v4.21.x)
- **Database:** MongoDB & Mongoose (v8.9.x)
- **Authentication:** `jsonwebtoken` (JWT) & `bcrypt` (10 rounds)
- **Real-Time WebSockets:** `Socket.IO` (v4.8.x)
- **Event Bus:** Node.js Native `EventEmitter` (`events`)
- **Environment Management:** `dotenv`
- **CORS:** `cors`

### Frontend:
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS (Dark SaaS Theme)
- **Icons:** `lucide-react`
- **Real-Time Client:** `socket.io-client`

---

## 3. Directory Structure

```text
Assignment-4/
├── package.json                   # Root helper scripts
├── README.md                      # Comprehensive lab report & documentation
├── backend/                       # Backend Express & Socket.IO server
│   ├── .env                       # Environment variables
│   ├── .env.example               # Example template for environment config
│   ├── package.json               # Backend dependencies and scripts
│   ├── server.js                  # Main server entry point (Express + Socket.IO + HTTP)
│   ├── test-backend.js            # Automated verification test suite
│   ├── config/
│   │   └── db.js                  # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js      # Signup, Login, and Me logic
│   │   └── noteController.js      # CRUD note handlers with ownership checks
│   ├── events/
│   │   └── eventHandler.js        # Node.js EventEmitter instance & event listeners
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification middleware & RBAC
│   ├── models/
│   │   ├── Note.js                # Note Mongoose schema (owner ref, timestamps)
│   │   └── User.js                # User Mongoose schema (bcrypt hook, comparePassword)
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth endpoints
│   │   └── noteRoutes.js          # /api/notes protected endpoints
│   └── sockets/
│       └── socketHandler.js       # Socket.IO connection, room join, and message handling
└── frontend/                      # React + Vite + Tailwind CSS dashboard
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── App.jsx                # Main container & tab router
        ├── api.js                 # Centralized fetch wrapper & JWT header injector
        ├── index.css              # Tailwind base directives & custom scrollbars
        ├── main.jsx               # React DOM entry point
        ├── components/
        │   ├── Navbar.jsx         # Header with breadcrumbs & Socket connection status
        │   └── Sidebar.jsx        # SaaS sidebar with badge counts & sign out
        ├── context/
        │   ├── AuthContext.jsx    # Authentication state, login & logout
        │   └── ToastContext.jsx   # Floating toast notification system
        └── pages/
            ├── AuthPage.jsx       # Split-screen Sign In / Register UI with demo credentials
            ├── DashboardOverview.jsx # Metrics overview, recent notes, and event stream
            ├── NotesPage.jsx      # Notes CRUD with search, modals, and confirmation dialog
            ├── ChatPage.jsx       # Real-time chat with rooms and online users
            ├── EventsPage.jsx     # Node.js EventEmitter live event inspector
            ├── ProfilePage.jsx    # User details and JWT token inspector
            └── SettingsPage.jsx   # System environment & server config
```

---

## 4. Environment Variables Setup

Create a `.env` file in `Assignment-4/backend/` (a template is provided at `.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/secure_connect
JWT_SECRET=supersecret_jwt_key_lab4_secure_connect_platform_2026
JWT_EXPIRES_IN=1d
```

---

## 5. Quick Start Instructions

### Prerequisites:
- Node.js (v18+)
- Local MongoDB running at `mongodb://127.0.0.1:27017`

### Step 1: Start Backend Server
```bash
cd Assignment-4/backend
npm install
npm start
```
*Expected Console Output:*
```
[server] listening on http://localhost:5000
[database] Connected to MongoDB successfully: 127.0.0.1/secure_connect
```

### Step 2: Start Frontend Application
In a new terminal window:
```bash
cd Assignment-4/frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### Step 3: Run Automated Backend Verification Tests
```bash
cd Assignment-4/backend
node test-backend.js
```

---

## 6. API Endpoints Documentation

| Method | Endpoint | Protection | Description | Expected Status |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/signup` | Public | Register new user (username, email, password) | `201 Created` |
| **POST** | `/api/auth/login` | Public | Authenticate user & return JWT token | `200 OK` |
| **GET** | `/api/auth/me` | JWT Required | Retrieve current user profile | `200 OK` |
| **GET** | `/api/notes` | JWT Required | Retrieve all notes owned by authenticated user | `200 OK` (or `403` if no token) |
| **POST** | `/api/notes` | JWT Required | Create a new note (title, content) | `201 Created` |
| **GET** | `/api/notes/:id` | JWT Required | Retrieve single note by ID (owner only) | `200 OK` |
| **PUT** | `/api/notes/:id` | JWT Required | Update note (owner only) | `200 OK` |
| **DELETE**| `/api/notes/:id` | JWT Required | Delete note (owner only) | `200 OK` |
| **GET** | `/api/events` | Public | Inspect EventEmitter logged events | `200 OK` |
| **GET** | `/api/stats` | Public | Platform stats (total users, notes) | `200 OK` |
| **GET** | `/api/health` | Public | Healthcheck endpoint | `200 OK` |

---

## 7. Assignment Screenshot Matching Reference

| Screenshot Reference | Feature | Expected Behavior & Screenshot Match |
| :--- | :--- | :--- |
| **Fig 1** | **Signup API** | `POST http://localhost:5000/api/auth/signup`<br>Status: `201 Created`<br>`{"message":"User registered","id":"...","username":"victor","email":"victor@example.com"}` |
| **Fig 1** | **Login API** | `POST http://localhost:5000/api/auth/login`<br>Status: `200 OK`<br>`{"message":"Login successful","token":"eyJhbGciOi..."}` |
| **Fig 2** | **Notes API with JWT** | `GET http://localhost:5000/api/notes`<br>Status: `200 OK`<br>`[{"_id":"...","title":"My First Note","content":"This is my first note of web dev -III","owner":"...","createdAt":"...","updatedAt":"..."}]` |
| **Fig 3** | **Socket.IO Console** | `User connected: <socket.id>`<br>`<socket.id> joined room general`<br>`[general] Aditi: Hey team, backend is ready 👋`<br>`[general] Rohan: Testing chat now...`<br>`[general] Aditi: Messages arriving in real time ⚡` |
| **Fig 4** | **Unauthorized Check** | `GET http://localhost:5000/api/notes` without token<br>Status: `403 Forbidden`<br>`{"message":"No token provided"}` |
| **Fig 4** | **Create Note API** | `POST http://localhost:5000/api/notes`<br>Status: `201 Created`<br>Returns created note object with `owner`, `createdAt`, `updatedAt` |

---

## 8. Real-Time Chat & EventEmitter Implementation

### Socket.IO Real-Time Architecture:
- Server: Initializes on HTTP server in `server.js` and handles events in `sockets/socketHandler.js`.
- Client: Connects via `socket.io-client` in `ChatPage.jsx`.
- Rooms: Users join rooms (e.g. `general`, `web-dev-lab`, `announcements`).
- Live Presence: Displays active user count and usernames per room.
- Events handled: `joinRoom`, `sendMessage`, `receiveMessage`, `roomUsers`, `systemMessage`, `disconnect`.

### Node.js EventEmitter Architecture:
- Custom subclass in `events/eventHandler.js` exporting `appEvents`.
- Handled events:
  - `userRegistered`: Triggered upon successful account creation.
  - `userLoggedIn`: Triggered upon user credential verification.
  - `noteCreated`: Triggered when a new note is added to MongoDB.
  - `noteUpdated`: Triggered when note title or content is modified.
  - `noteDeleted`: Triggered when a note is removed.
  - `chatMessage`: Triggered when a message is sent over Socket.IO.
- All events are logged to the console and maintained in a circular buffer viewable at `/api/events` and through the frontend "Event Stream" tab.

---

## 9. Security Highlights

1. **Password Hashing:** Passwords are never stored in plain text. Mongoose pre-save hook executes `bcrypt.hash(password, 10)` before writing to the database.
2. **Stateless JWT Sessions:** Cryptographically signed tokens using `HMAC-SHA256` (`HS256`) with configurable expiration (`1d`).
3. **Route Protection:** Protected endpoints pass through `authMiddleware` which verifies tokens from headers (`Authorization: Bearer <token>`). Missing tokens trigger an immediate `403 Forbidden` response.
4. **Data Isolation:** User ID is embedded in the signed JWT payload. The Notes API retrieves and modifies only documents where `owner === req.user.id`.
