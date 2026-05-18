# 💬 ChatWave — Real-Time Chat App

A full-stack real-time chat application built with **React.js**, **Node.js**, **Express**, **Socket.io**, and **MongoDB**.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Context API |
| Backend | Node.js, Express.js |
| Real-Time | Socket.io (WebSockets) |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| State | React Context API + Custom Hooks |

---

## 📁 Project Structure

```
chat-app/
├── server/
│   └── src/
│       ├── index.js           # Entry point, Express + Socket.io setup
│       ├── socket.js          # All real-time socket event handlers
│       ├── models/
│       │   ├── User.js        # User schema (bcrypt hashing built-in)
│       │   ├── Room.js        # Chat room schema
│       │   └── Message.js     # Message schema
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── roomController.js
│       │   └── messageController.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── rooms.js
│       │   └── messages.js
│       └── middleware/
│           └── auth.js        # JWT verification middleware
│
└── client/
    └── src/
        ├── App.js             # Routes + auth guards
        ├── context/
        │   ├── AuthContext.js  # Global auth state
        │   └── SocketContext.js # Socket.io connection management
        ├── hooks/
        │   └── useChat.js      # Custom hook: messages, typing, send
        ├── pages/
        │   ├── AuthPage.js     # Login / Register
        │   └── ChatPage.js     # Main chat layout
        └── components/
            ├── Sidebar.js      # Room list + create room + online users
            ├── ChatWindow.js   # Message area + input
            └── MessageBubble.js # Individual message component
```

---

## ⚡ Features

- ✅ **JWT Authentication** — Register/Login with secure token-based auth
- ✅ **Real-time messaging** — Socket.io WebSocket connection per user
- ✅ **Chat rooms** — Create, join, and browse public rooms
- ✅ **Typing indicators** — "User is typing..." with debounce
- ✅ **Online/offline status** — Live user presence tracking
- ✅ **Message grouping** — Messages grouped by sender & time
- ✅ **System messages** — Join/leave notifications
- ✅ **Message history** — Paginated message loading from MongoDB
- ✅ **Socket auth middleware** — JWT verified on WebSocket connection
- ✅ **Protected routes** — React Router auth guards

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Clone and install

```bash
git clone <your-repo>
cd chat-app

# Install root devDependencies
npm install

# Install server + client dependencies
npm run install:all
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:3000
```

### 3. Run the app

```bash
# From root — runs both server and client
npm run dev

# Or separately:
npm run server    # Backend on :5000
npm run client    # Frontend on :3000
```

Open http://localhost:3000

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Rooms
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/rooms` | Get all public rooms |
| POST | `/api/rooms` | Create a new room |
| POST | `/api/rooms/:id/join` | Join a room |

### Messages
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/messages/:roomId` | Get message history (paginated) |

---

## 🔌 Socket.io Events

### Client → Server
| Event | Payload | Description |
|---|---|---|
| `join_room` | `{ roomId }` | Join a chat room |
| `leave_room` | `{ roomId }` | Leave a chat room |
| `send_message` | `{ roomId, content }` | Send a message |
| `typing_start` | `{ roomId }` | Start typing |
| `typing_stop` | `{ roomId }` | Stop typing |

### Server → Client
| Event | Payload | Description |
|---|---|---|
| `receive_message` | Message object | New message received |
| `system_message` | Message object | Join/leave notification |
| `user_typing` | `{ userId, username }` | Someone is typing |
| `user_stop_typing` | `{ userId }` | Someone stopped typing |
| `online_users` | `string[]` (user IDs) | Updated online users list |

---

## 🧑‍💻 Interview Talking Points

1. **Why Socket.io over plain WebSockets?** — Auto-reconnection, fallback to polling, rooms/namespaces built-in.
2. **How is JWT verified on the socket?** — `io.use()` middleware runs before `connection`, verifies the token from `socket.handshake.auth`.
3. **How do you prevent message flooding?** — Input length validation on both client and server, debounced typing events.
4. **How does typing indicator work?** — Client emits `typing_start`, sets a 2s timeout to emit `typing_stop`. Server relays to all room members except sender.
5. **How is auth state shared?** — React Context API (`AuthContext`) wraps the app, exposes `user`, `login`, `logout` to all components.

---

## 🔮 Possible Extensions

- [ ] File/image sharing (Multer + Cloudinary)
- [ ] Direct messages (private rooms)
- [ ] Message reactions (emoji)
- [ ] Read receipts
- [ ] Push notifications
- [ ] Redis adapter for horizontal scaling (multiple server instances)
